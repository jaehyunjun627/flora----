package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // 페이징 지원
    Page<Product> findByIsActiveTrue(Pageable pageable);
    Page<Product> findByCategoryAndIsActiveTrue(String category, Pageable pageable);

    // 리스트
    List<Product> findByCategoryAndIsActiveTrue(String category);
    List<Product> findBySellerIdAndIsActiveTrue(Long sellerId);
    List<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    List<Product> findByIsGroupBuyTrueAndIsActiveTrue();
    long countBySellerId(Long sellerId);
}
