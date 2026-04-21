package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderedAtDesc(Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    long countByUserId(Long userId);

    // 판매자: 자기 상품에 대한 주문 조회
    @Query("SELECT o FROM Order o JOIN FETCH o.product p JOIN FETCH o.user WHERE p.seller.id = :sellerId ORDER BY o.orderedAt DESC")
    List<Order> findByProductSellerIdOrderByOrderedAtDesc(@Param("sellerId") Long sellerId);

    // 판매자: 상태별 주문 조회
    @Query("SELECT o FROM Order o JOIN FETCH o.product p JOIN FETCH o.user WHERE p.seller.id = :sellerId AND o.status = :status ORDER BY o.orderedAt DESC")
    List<Order> findByProductSellerIdAndStatusOrderByOrderedAtDesc(@Param("sellerId") Long sellerId, @Param("status") String status);

    // 판매자: 주문 건수
    @Query("SELECT COUNT(o) FROM Order o WHERE o.product.seller.id = :sellerId")
    long countByProductSellerId(@Param("sellerId") Long sellerId);

    // 판매자: 상태별 주문 건수
    @Query("SELECT COUNT(o) FROM Order o WHERE o.product.seller.id = :sellerId AND o.status = :status")
    long countByProductSellerIdAndStatus(@Param("sellerId") Long sellerId, @Param("status") String status);
}
