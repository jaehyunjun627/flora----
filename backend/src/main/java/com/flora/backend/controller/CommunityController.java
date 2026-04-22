package com.flora.backend.controller;

import com.flora.backend.dto.ApiResponse;
import com.flora.backend.service.CommunityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Page<?>>> getPosts(
        @RequestParam(defaultValue = "") String category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        log.debug("커뮤니티 게시글 목록 조회: category={}, page={}, size={}", category, page, size);
        Page<?> posts = communityService.getPosts(category, page, size);
        return ResponseEntity.ok(
                ApiResponse.success("게시글 목록 조회 성공", posts)
        );
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<?>> getPost(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (authentication != null) ? (Long) authentication.getPrincipal() : null;
        log.debug("게시글 상세 조회: 게시글ID={}, 사용자={}", id, userId);
        
        return ResponseEntity.ok(
                ApiResponse.success("게시글 조회 성공", communityService.getPost(id, userId))
        );
    }

    @PostMapping("/posts")
    public ResponseEntity<ApiResponse<?>> createPost(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();

        String title = body.get("title");
        String content = body.get("content");
        String category = body.get("category");

        if (title == null || title.isBlank()) throw new IllegalArgumentException("제목은 필수입니다");
        if (content == null || content.isBlank()) throw new IllegalArgumentException("내용은 필수입니다");
        if (category == null || category.isBlank()) throw new IllegalArgumentException("카테고리는 필수입니다");
        if (title.length() > 200) throw new IllegalArgumentException("제목은 200자 이하여야 합니다");

        log.info("게시글 작성 요청: 사용자={}, 제목={}", userId, title);

        try {
            Object result = communityService.createPost(userId, title, content, category);
            log.info("게시글 작성 완료: 사용자={}", userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("게시글이 작성되었습니다.", result)
            );
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("게시글 작성 실패: 사용자={}", userId, e);
            throw e;
        }
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<ApiResponse<?>> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();

        String content = (String) body.get("content");
        if (content == null || content.isBlank()) throw new IllegalArgumentException("댓글 내용은 필수입니다");

        Long parentId = body.get("parentCommentId") != null ?
                Long.valueOf(body.get("parentCommentId").toString()) : null;

        log.info("댓글 작성 요청: 게시글ID={}, 사용자={}, 부모댓글ID={}", id, userId, parentId);

        try {
            Object result = communityService.addComment(id, userId, content, parentId);
            log.info("댓글 작성 완료: 게시글ID={}, 사용자={}", id, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("댓글이 작성되었습니다.", result)
            );
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("댓글 작성 실패: 게시글ID={}, 사용자={}", id, userId, e);
            throw e;
        }
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<ApiResponse<?>> toggleLike(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("좋아요 토글: 게시글ID={}, 사용자={}", id, userId);
        
        try {
            Object result = communityService.toggleLike(id, userId);
            log.info("좋아요 토글 완료: 게시글ID={}", id);
            return ResponseEntity.ok(
                    ApiResponse.success("좋아요가 변경되었습니다.", result)
            );
        } catch (Exception e) {
            log.error("좋아요 변경 실패: 게시글ID={}, 사용자={}", id, userId, e);
            throw e;
        }
    }

    @GetMapping("/posts/{id}/likes")
    public ResponseEntity<ApiResponse<?>> getLikers(@PathVariable Long id) {
        log.debug("게시글 좋아요 목록 조회: 게시글ID={}", id);
        return ResponseEntity.ok(
                ApiResponse.success("좋아요 목록 조회 성공", communityService.getLikers(id))
        );
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<?>> updatePost(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();

        String title = body.get("title");
        String content = body.get("content");

        if (title == null || title.isBlank()) throw new IllegalArgumentException("제목은 필수입니다");
        if (content == null || content.isBlank()) throw new IllegalArgumentException("내용은 필수입니다");
        if (title.length() > 200) throw new IllegalArgumentException("제목은 200자 이하여야 합니다");

        log.info("게시글 수정 요청: 게시글ID={}, 사용자={}", id, userId);

        try {
            Object result = communityService.updatePost(id, userId, title, content);
            log.info("게시글 수정 완료: 게시글ID={}", id);
            return ResponseEntity.ok(
                    ApiResponse.success("게시글이 수정되었습니다.", result)
            );
        } catch (RuntimeException e) {
            log.warn("게시글 수정 권한 오류: 게시글ID={}, 사용자={}", id, userId);
            throw e;
        }
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<?>> updateComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("댓글 수정 요청: 댓글ID={}, 사용자={}", id, userId);
        
        try {
            Object result = communityService.updateComment(id, userId, body.get("content"));
            log.info("댓글 수정 완료: 댓글ID={}", id);
            return ResponseEntity.ok(
                    ApiResponse.success("댓글이 수정되었습니다.", result)
            );
        } catch (RuntimeException e) {
            log.warn("댓글 수정 권한 오류: 댓글ID={}, 사용자={}", id, userId);
            throw e;
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<?>> deletePost(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("게시글 삭제 요청: 게시글ID={}, 사용자={}", id, userId);
        
        try {
            communityService.deletePost(id, userId);
            log.info("게시글 삭제 완료: 게시글ID={}", id);
            return ResponseEntity.ok(
                    ApiResponse.success("게시글이 삭제되었습니다.", null)
            );
        } catch (RuntimeException e) {
            log.warn("게시글 삭제 권한 오류: 게시글ID={}, 사용자={}", id, userId);
            throw e;
        }
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<?>> deleteComment(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("댓글 삭제 요청: 댓글ID={}, 사용자={}", id, userId);
        
        try {
            communityService.deleteComment(id, userId);
            log.info("댓글 삭제 완료: 댓글ID={}", id);
            return ResponseEntity.ok(
                    ApiResponse.success("댓글이 삭제되었습니다.", null)
            );
        } catch (RuntimeException e) {
            log.warn("댓글 삭제 권한 오류: 댓글ID={}, 사용자={}", id, userId);
            throw e;
        }
    }
}
