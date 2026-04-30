package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.dto.OrderDto;
import com.flora.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserId(String token) {
        return jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getMyOrders(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.getMyOrders(getUserId(token)));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.getOrder(orderId, getUserId(token)));
    }

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            @Valid @RequestBody OrderDto request,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.createOrderFromCart(request, getUserId(token)));
    }

    /**
     * 예약 발송 주문 (단일 구매 / 구독 첫 회차) — 장바구니 의존 없이 직접 생성.
     * 주문 내역(/api/orders) 에서 정상 조회됩니다.
     */
    @PostMapping("/scheduled")
    public ResponseEntity<OrderDto> createScheduledOrder(
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.createScheduledOrder(request, getUserId(token)));
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, getUserId(token)));
    }
}
