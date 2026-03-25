package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.dto.CartItemDto;
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

    @GetMapping
    public ResponseEntity<List<CartItemDto>> getCart(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(cartService.getCartItems(getUserId(token)));
    }

    @PostMapping
    public ResponseEntity<CartItemDto> addToCart(
            @Valid @RequestBody CartItemDto request,
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(cartService.addToCart(request, getUserId(token)));
    }

    @PatchMapping("/{cartItemId}")
    public ResponseEntity<CartItemDto> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> body,
            @RequestHeader("Authorization") String token) {
        Integer quantity = body.get("quantity");
        if (quantity == null || quantity < 1) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cartService.updateQuantity(cartItemId, quantity, getUserId(token)));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long cartItemId,
            @RequestHeader("Authorization") String token) {
        cartService.removeItem(cartItemId, getUserId(token));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader("Authorization") String token) {
        cartService.clearCart(getUserId(token));
        return ResponseEntity.noContent().build();
    }
}
