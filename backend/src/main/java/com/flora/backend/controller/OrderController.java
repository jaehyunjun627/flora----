package com.flora.backend.controller;

import com.flora.backend.dto.ApiResponse;
import com.flora.backend.dto.OrderDto;
import com.flora.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.debug("사용자 주문 목록 조회: 사용자={}", userId);
        
        List<OrderDto> orders = orderService.getMyOrders(userId);
        return ResponseEntity.ok(
                ApiResponse.success("주문 목록 조회 성공", orders)
        );
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.debug("주문 상세 조회: 주문ID={}, 사용자={}", orderId, userId);
        
        OrderDto order = orderService.getOrder(orderId, userId);
        return ResponseEntity.ok(
                ApiResponse.success("주문 조회 성공", order)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            @Valid @RequestBody OrderDto request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("주문 생성 요청: 사용자={}, 총액={}", userId, request.getTotalPrice());
        
        try {
            OrderDto result = orderService.createOrderFromCart(request, userId);
            log.info("주문 생성 성공: 주문ID={}, 사용자={}, 총액={}", result.getId(), userId, result.getTotalPrice());
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("주문이 생성되었습니다.", result)
            );
        } catch (Exception e) {
            log.error("주문 생성 실패: 사용자={}", userId, e);
            throw e;
        }
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("주문 취소 요청: 주문ID={}, 사용자={}", orderId, userId);
        
        try {
            OrderDto result = orderService.cancelOrder(orderId, userId);
            log.info("주문 취소 완료: 주문ID={}", orderId);
            return ResponseEntity.ok(
                    ApiResponse.success("주문이 취소되었습니다.", result)
            );
        } catch (Exception e) {
            log.error("주문 취소 실패: 주문ID={}, 사용자={}", orderId, userId, e);
            throw e;
        }
    }
}
