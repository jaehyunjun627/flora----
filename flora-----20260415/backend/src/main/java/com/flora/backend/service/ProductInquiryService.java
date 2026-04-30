package com.flora.backend.service;

import com.flora.backend.dto.ProductInquiryDto;
import com.flora.backend.entity.Product;
import com.flora.backend.entity.ProductInquiry;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.ProductInquiryRepository;
import com.flora.backend.repository.jpa.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductInquiryService {

    private final ProductInquiryRepository inquiryRepository;
    private final ProductRepository productRepository;

    // ── 상품 문의 목록 ──
    public List<ProductInquiryDto> getInquiries(Long productId, Long currentUserId, String role) {
        boolean isSeller = "SELLER".equals(role) || "ADMIN".equals(role);
        return inquiryRepository.findByProductIdAndIsActiveTrueOrderByCreatedAtDesc(productId)
                .stream()
                .map(q -> ProductInquiryDto.from(q, currentUserId != null ? currentUserId : -1L, isSeller))
                .collect(Collectors.toList());
    }

    // ── 문의 등록 ──
    @Transactional
    public ProductInquiryDto createInquiry(Long productId, User user, Map<String, Object> body) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        String title = (String) body.get("title");
        String content = (String) body.get("content");
        boolean isSecret = Boolean.TRUE.equals(body.get("isSecret"));

        if (title == null || title.trim().isEmpty()) throw new RuntimeException("제목을 입력해주세요.");
        if (content == null || content.trim().isEmpty()) throw new RuntimeException("내용을 입력해주세요.");

        ProductInquiry inquiry = ProductInquiry.builder()
                .product(product)
                .user(user)
                .title(title.trim())
                .content(content.trim())
                .isSecret(isSecret)
                .build();

        ProductInquiry saved = inquiryRepository.save(inquiry);
        return ProductInquiryDto.from(saved, user.getId(), false);
    }

    // ── 문의 답변 (판매자/관리자) ──
    @Transactional
    public ProductInquiryDto answer(Long inquiryId, User user, String answerText) {
        ProductInquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다."));

        boolean isSeller = "SELLER".equals(user.getRole()) || "ADMIN".equals(user.getRole());
        if (!isSeller) throw new RuntimeException("답변 권한이 없습니다.");

        inquiry.setAnswer(answerText);
        inquiry.setIsAnswered(true);
        inquiry.setAnsweredAt(LocalDateTime.now());
        ProductInquiry saved = inquiryRepository.save(inquiry);
        return ProductInquiryDto.from(saved, user.getId(), true);
    }

    // ── 문의 삭제 ──
    @Transactional
    public void deleteInquiry(Long inquiryId, User user) {
        ProductInquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다."));
        if (!inquiry.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        inquiry.setIsActive(false);
        inquiryRepository.save(inquiry);
    }
}
