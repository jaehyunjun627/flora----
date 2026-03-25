package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.dto.OrderRequest;
import com.flora.backend.dto.OrderResponse;
import com.flora.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserId(String token) {
        return jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
    }

    // 내 주문 목록
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.getMyOrders(getUserId(token)));
    }

    // 주문 상세
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.getOrder(orderId, getUserId(token)));
    }

    // 주문 생성 (장바구니 → 주문)
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.createOrderFromCart(request, getUserId(token)));
    }

    // 주문 취소
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, getUserId(token)));
    }
}
