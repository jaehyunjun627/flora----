package com.flora.backend.controller;

import com.flora.backend.dto.ProductReviewDto;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.UserRepository;
import com.flora.backend.service.ProductReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ProductReviewController {

    private final ProductReviewService reviewService;
    private final UserRepository userRepository;

    private User getUser(Authentication auth) {
        if (auth == null) return null;
        try {
            Long userId = Long.parseLong(auth.getName());
            return userRepository.findById(userId).orElse(null);
        } catch (NumberFormatException e) {
            return userRepository.findByEmail(auth.getName()).orElse(null);
        }
    }

    // ── 리뷰 목록 ──
    @GetMapping
    public ResponseEntity<Map<String, Object>> getReviews(
            @PathVariable Long productId,
            Authentication auth) {
        List<ProductReviewDto> reviews = reviewService.getReviews(productId);
        User user = getUser(auth);
        boolean hasReviewed = user != null && reviewService.hasReviewed(productId, user.getId());
        return ResponseEntity.ok(Map.of("reviews", reviews, "hasReviewed", hasReviewed));
    }

    // ── 리뷰 등록 ──
    @PostMapping
    public ResponseEntity<?> createReview(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        try {
            ProductReviewDto dto = reviewService.createReview(productId, user, body);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── 리뷰 삭제 ──
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();
        try {
            reviewService.deleteReview(reviewId, user);
            return ResponseEntity.ok(Map.of("message", "리뷰가 삭제됐습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
