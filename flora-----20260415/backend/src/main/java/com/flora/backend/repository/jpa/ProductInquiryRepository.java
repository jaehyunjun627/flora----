package com.flora.backend.repository.jpa;

import com.flora.backend.entity.ProductInquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductInquiryRepository extends JpaRepository<ProductInquiry, Long> {
    List<ProductInquiry> findByProductIdAndIsActiveTrueOrderByCreatedAtDesc(Long productId);
    List<ProductInquiry> findByUserIdOrderByCreatedAtDesc(Long userId);
}
