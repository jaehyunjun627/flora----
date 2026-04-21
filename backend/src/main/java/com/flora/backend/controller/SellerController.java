package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.dto.OrderDto;
import com.flora.backend.dto.ProductDto;
import com.flora.backend.service.SellerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserId(String token) {
        return jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
    }

    // ===== 대시보드 통계 =====
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(sellerService.getDashboardStats(getUserId(token)));
    }

    // ===== 주문 관리 =====
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDto>> getSellerOrders(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(sellerService.getSellerOrders(getUserId(token), status));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderDto> getSellerOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(sellerService.getSellerOrder(orderId, getUserId(token)));
    }

    // 주문 확인 (PENDING → PREPARING)
    @PatchMapping("/orders/{orderId}/confirm")
    public ResponseEntity<OrderDto> confirmOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(sellerService.confirmOrder(orderId, getUserId(token)));
    }

    // 배송 시작 (PREPARING → SHIPPING) - 택배사 + 송장번호 입력
    @PatchMapping("/orders/{orderId}/ship")
    public ResponseEntity<OrderDto> shipOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> shipInfo,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(sellerService.shipOrder(
                orderId, getUserId(token),
                shipInfo.get("courierName"),
                shipInfo.get("trackingNumber")));
    }

    // 배송 완료 (SHIPPING → DELIVERED)
    @PatchMapping("/orders/{orderId}/deliver")
    public ResponseEntity<OrderDto> deliverOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(sellerService.deliverOrder(orderId, getUserId(token)));
    }

    // ===== 상품 관리 =====
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getSellerProducts(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(sellerService.getSellerProducts(getUserId(token)));
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductDto request,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(sellerService.updateProduct(productId, request, getUserId(token)));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId,
            @RequestHeader("Authorization") String token) {
        sellerService.deleteProduct(productId, getUserId(token));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/products/{productId}/toggle")
    public ResponseEntity<ProductDto> toggleProductActive(
            @PathVariable Long productId,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(sellerService.toggleProductActive(productId, getUserId(token)));
    }
}
