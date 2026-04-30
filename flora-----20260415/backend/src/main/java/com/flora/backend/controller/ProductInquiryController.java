package com.flora.backend.controller;

import com.flora.backend.dto.ProductInquiryDto;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.UserRepository;
import com.flora.backend.service.ProductInquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products/{productId}/inquiries")
@RequiredArgsConstructor
public class ProductInquiryController {

    private final ProductInquiryService inquiryService;
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

    // ── 문의 목록 ──
    @GetMapping
    public ResponseEntity<List<ProductInquiryDto>> getInquiries(
            @PathVariable Long productId,
            Authentication auth) {
        User user = getUser(auth);
        Long userId = user != null ? user.getId() : null;
        String role = user != null ? user.getRole() : "USER";
        return ResponseEntity.ok(inquiryService.getInquiries(productId, userId, role));
    }

    // ── 문의 등록 ──
    @PostMapping
    public ResponseEntity<?> createInquiry(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        try {
            ProductInquiryDto dto = inquiryService.createInquiry(productId, user, body);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── 문의 답변 (판매자/관리자) ──
    @PatchMapping("/{inquiryId}/answer")
    public ResponseEntity<?> answer(
            @PathVariable Long productId,
            @PathVariable Long inquiryId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();
        try {
            ProductInquiryDto dto = inquiryService.answer(inquiryId, user, body.get("answer"));
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── 문의 삭제 ──
    @DeleteMapping("/{inquiryId}")
    public ResponseEntity<?> deleteInquiry(
            @PathVariable Long productId,
            @PathVariable Long inquiryId,
            Authentication auth) {
        User user = getUser(auth);
        if (user == null) return ResponseEntity.status(401).build();
        try {
            inquiryService.deleteInquiry(inquiryId, user);
            return ResponseEntity.ok(Map.of("message", "문의가 삭제됐습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
