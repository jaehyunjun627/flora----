package com.flora.backend.repository.jpa;

import com.flora.backend.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdAndIsActiveTrueOrderByCreatedAtDesc(Long productId);
    boolean existsByProductIdAndUserId(Long productId, Long userId);
    long countByProductIdAndIsActiveTrue(Long productId);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId AND r.isActive = true")
    Double avgRatingByProductId(Long productId);

    Optional<ProductReview> findByProductIdAndUserId(Long productId, Long userId);
}
