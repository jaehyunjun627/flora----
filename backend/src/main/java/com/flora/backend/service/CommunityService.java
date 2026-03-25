package com.flora.backend.service;

import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;

    public Page<Map<String, Object>> getPosts(String category, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<CommunityPost> posts = category == null || category.isBlank()
            ? postRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
            : postRepository.findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(category, pageable);

        return posts.map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("title", p.getTitle());
            map.put("content", p.getContent() != null && p.getContent().length() > 100
                ? p.getContent().substring(0, 100) + "..." : p.getContent());
            map.put("category", p.getCategory());
            map.put("authorId", p.getUser().getId());
            map.put("authorNickname", p.getUser().getNickname());
            map.put("authorRole", p.getUser().getRole());
            map.put("viewCount", p.getViewCount());
            map.put("createdAt", p.getCreatedAt());
            map.put("likeCount", likeRepository.countByTargetTypeAndTargetId("POST", p.getId()));
            map.put("commentCount", commentRepository
                .findByTargetTypeAndTargetIdAndIsActiveTrueOrderByCreatedAtAsc("POST", p.getId()).size());
            return map;
        });
    }

    @Transactional
    public Map<String, Object> getPost(Long id, Long userId) {
        CommunityPost post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);

        List<Comment> comments = commentRepository
            .findByTargetTypeAndTargetIdAndIsActiveTrueOrderByCreatedAtAsc("POST", id);
        List<Map<String, Object>> commentList = comments.stream().map(c -> {
            Map<String, Object> cm = new HashMap<>();
            cm.put("id", c.getId());
            cm.put("content", c.getContent());
            cm.put("authorId", c.getUser().getId());
            cm.put("authorNickname", c.getUser().getNickname());
            cm.put("authorProfileEmoji", c.getUser().getProfileEmoji());
            cm.put("authorRole", c.getUser().getRole());
            cm.put("parentCommentId", c.getParentCommentId());
            cm.put("createdAt", c.getCreatedAt());
            return cm;
        }).toList();

        long likeCount = likeRepository.countByTargetTypeAndTargetId("POST", id);
        boolean liked = userId != null && likeRepository
            .findByTargetTypeAndTargetIdAndUserId("POST", id, userId).isPresent();

        Map<String, Object> result = new HashMap<>();
        result.put("id", post.getId());
        result.put("title", post.getTitle());
        result.put("content", post.getContent());
        result.put("category", post.getCategory());
        result.put("authorId", post.getUser().getId());
        result.put("authorNickname", post.getUser().getNickname());
        result.put("authorProfileEmoji", post.getUser().getProfileEmoji());
        result.put("authorRole", post.getUser().getRole());
        result.put("viewCount", post.getViewCount());
        result.put("createdAt", post.getCreatedAt());
        result.put("likeCount", likeCount);
        result.put("liked", liked);
        result.put("comments", commentList);
        return result;
    }

    @Transactional
    public Map<String, Object> createPost(Long userId, String title, String content, String category) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        // 공지사항은 ADMIN만 작성 가능
        if ("공지".equals(category) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("공지사항은 관리자만 작성할 수 있습니다");
        }

        CommunityPost post = CommunityPost.builder()
            .user(user).title(title).content(content).category(category).build();
        postRepository.save(post);
        return Map.of("id", post.getId(), "message", "게시글이 등록되었습니다");
    }

    @Transactional
    public Map<String, Object> updatePost(Long postId, Long userId, String title, String content) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        boolean isAuthor = post.getUser().getId().equals(userId);
        boolean isAdmin = "ADMIN".equals(user.getRole());
        if (!isAuthor && !isAdmin) {
            throw new RuntimeException("수정 권한이 없습니다");
        }

        post.setTitle(title);
        post.setContent(content);
        postRepository.save(post);
        return Map.of("message", "게시글이 수정되었습니다");
    }

    @Transactional
    public Map<String, Object> updateComment(Long commentId, Long userId, String content) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        boolean isAuthor = comment.getUser().getId().equals(userId);
        boolean isAdmin = "ADMIN".equals(user.getRole());
        if (!isAuthor && !isAdmin) {
            throw new RuntimeException("수정 권한이 없습니다");
        }

        comment.setContent(content);
        commentRepository.save(comment);
        return Map.of("message", "댓글이 수정되었습니다");
    }

    @Transactional
    public Map<String, Object> deletePost(Long postId, Long userId) {
        CommunityPost post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        // 작성자 또는 ADMIN만 삭제 가능
        boolean isAuthor = post.getUser().getId().equals(userId);
        boolean isAdmin = "ADMIN".equals(user.getRole());
        if (!isAuthor && !isAdmin) {
            throw new RuntimeException("삭제 권한이 없습니다");
        }

        post.setIsActive(false);
        postRepository.save(post);
        return Map.of("message", "게시글이 삭제되었습니다");
    }

    @Transactional
    public Map<String, Object> deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        boolean isAuthor = comment.getUser().getId().equals(userId);
        boolean isAdmin = "ADMIN".equals(user.getRole());
        if (!isAuthor && !isAdmin) {
            throw new RuntimeException("삭제 권한이 없습니다");
        }

        comment.setIsActive(false);
        commentRepository.save(comment);
        return Map.of("message", "댓글이 삭제되었습니다");
    }

    @Transactional
    public Map<String, Object> addComment(Long postId, Long userId, String content, Long parentId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        Comment comment = Comment.builder()
            .targetType("POST").targetId(postId)
            .user(user).content(content).parentCommentId(parentId).build();
        commentRepository.save(comment);
        return Map.of("id", comment.getId(), "message", "댓글이 등록되었습니다");
    }

    @Transactional
    public Map<String, Object> toggleLike(Long postId, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        Optional<Like> existing = likeRepository.findByTargetTypeAndTargetIdAndUserId("POST", postId, userId);
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            return Map.of("liked", false, "likeCount", likeRepository.countByTargetTypeAndTargetId("POST", postId));
        } else {
            likeRepository.save(Like.builder().targetType("POST").targetId(postId).user(user).build());
            return Map.of("liked", true, "likeCount", likeRepository.countByTargetTypeAndTargetId("POST", postId));
        }
    }
}
