package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.dto.OrderDto;
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

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, getUserId(token)));
    }
}
