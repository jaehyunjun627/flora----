package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/posts")
    public ResponseEntity<?> getPosts(
        @RequestParam(defaultValue = "") String category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(communityService.getPosts(category, page, size));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPost(@PathVariable Long id,
                                     @RequestHeader(value = "Authorization", required = false) String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(communityService.getPost(id, userId));
    }

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Map<String, String> body,
                                        @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(communityService.createPost(userId, body.get("title"), body.get("content"), body.get("category")));
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id,
                                        @RequestBody Map<String, Object> body,
                                        @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        Long parentId = body.get("parentCommentId") != null ? Long.valueOf(body.get("parentCommentId").toString()) : null;
        return ResponseEntity.ok(communityService.addComment(id, userId, (String) body.get("content"), parentId));
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id,
                                        @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(communityService.toggleLike(id, userId));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id,
                                        @RequestBody Map<String, String> body,
                                        @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        try {
            return ResponseEntity.ok(communityService.updatePost(id, userId, body.get("title"), body.get("content")));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id,
                                           @RequestBody Map<String, String> body,
                                           @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        try {
            return ResponseEntity.ok(communityService.updateComment(id, userId, body.get("content")));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id,
                                        @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        try {
            return ResponseEntity.ok(communityService.deletePost(id, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id,
                                           @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        try {
            return ResponseEntity.ok(communityService.deleteComment(id, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }

    private Long extractUserId(String token) {
        if (token == null || !token.startsWith("Bearer ")) return null;
        try { return jwtTokenProvider.getUserId(token.substring(7)); } catch (Exception e) { return null; }
    }
}
