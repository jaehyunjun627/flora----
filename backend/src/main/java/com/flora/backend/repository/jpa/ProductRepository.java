package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);

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
