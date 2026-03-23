package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.dto.CartItemRequest;
import com.flora.backend.dto.CartItemResponse;
import com.flora.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserId(String token) {
        return jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
    }

    // 장바구니 조회
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(cartService.getCartItems(getUserId(token)));
    }

    // 상품 추가
    @PostMapping
    public ResponseEntity<CartItemResponse> addToCart(
            @Valid @RequestBody CartItemRequest request,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(cartService.addToCart(request, getUserId(token)));
    }

    // 수량 변경
    @PatchMapping("/{cartItemId}")
    public ResponseEntity<CartItemResponse> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> body,
            @RequestHeader("Authorization") String token) {
        Integer quantity = body.get("quantity");
        if (quantity == null || quantity < 1) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cartService.updateQuantity(cartItemId, quantity, getUserId(token)));
    }

    // 개별 삭제
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long cartItemId,
            @RequestHeader("Authorization") String token) {
        cartService.removeItem(cartItemId, getUserId(token));
        return ResponseEntity.noContent().build();
    }

    // 전체 비우기
    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader("Authorization") String token) {
        cartService.clearCart(getUserId(token));
        return ResponseEntity.noContent().build();
    }
}
