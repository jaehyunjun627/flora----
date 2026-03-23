package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderedAtDesc(Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    long countByUserId(Long userId);
}
