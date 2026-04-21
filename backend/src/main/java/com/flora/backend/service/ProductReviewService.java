package com.flora.backend.service;

import com.flora.backend.dto.ProductReviewDto;
import com.flora.backend.entity.Product;
import com.flora.backend.entity.ProductReview;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.ProductRepository;
import com.flora.backend.repository.jpa.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    // ── 리뷰 목록 ──
    public List<ProductReviewDto> getReviews(Long productId) {
        return reviewRepository.findByProductIdAndIsActiveTrueOrderByCreatedAtDesc(productId)
                .stream().map(ProductReviewDto::from).collect(Collectors.toList());
    }

    // ── 리뷰 등록 ──
    @Transactional
    public ProductReviewDto createReview(Long productId, User user, Map<String, Object> body) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        // 중복 리뷰 방지
        if (reviewRepository.existsByProductIdAndUserId(productId, user.getId())) {
            throw new RuntimeException("이미 리뷰를 작성하셨습니다.");
        }

        int rating = Integer.parseInt(body.get("rating").toString());
        if (rating < 1 || rating > 5) throw new RuntimeException("평점은 1~5 사이여야 합니다.");
        String content = (String) body.get("content");
        if (content == null || content.trim().length() < 5) throw new RuntimeException("리뷰 내용은 5자 이상 입력해주세요.");

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .rating(rating)
                .content(content.trim())
                .imageUrl((String) body.get("imageUrl"))
                .build();

        ProductReview saved = reviewRepository.save(review);

        // 상품 평점/리뷰 수 업데이트
        long count = reviewRepository.countByProductIdAndIsActiveTrue(productId);
        Double avg = reviewRepository.avgRatingByProductId(productId);
        product.setReviewCount((int) count);
        if (avg != null) product.setRating(java.math.BigDecimal.valueOf(avg));
        productRepository.save(product);

        return ProductReviewDto.from(saved);
    }

    // ── 리뷰 삭제 ──
    @Transactional
    public void deleteReview(Long reviewId, User user) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        if (!review.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        review.setIsActive(false);
        reviewRepository.save(review);
    }

    // ── 내가 리뷰 썼는지 ──
    public boolean hasReviewed(Long productId, Long userId) {
        return reviewRepository.existsByProductIdAndUserId(productId, userId);
    }
}
