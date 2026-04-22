package com.flora.backend.controller;

import com.flora.backend.dto.ApiResponse;
import com.flora.backend.dto.CartItemDto;
import com.flora.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItemDto>>> getCart(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.debug("장바구니 조회: 사용자={}", userId);
        
        List<CartItemDto> items = cartService.getCartItems(userId);
        return ResponseEntity.ok(
                ApiResponse.success("장바구니 조회 성공", items)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartItemDto>> addToCart(
            @Valid @RequestBody CartItemDto request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("장바구니 추가: 사용자={}, 상품ID={}, 수량={}", userId, request.getProductId(), request.getQuantity());
        
        try {
            CartItemDto result = cartService.addToCart(request, userId);
            log.info("장바구니 추가 성공: 사용자={}, 상품ID={}", userId, request.getProductId());
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("상품이 장바구니에 추가되었습니다.", result)
            );
        } catch (Exception e) {
            log.error("장바구니 추가 실패: 사용자={}, 상품ID={}", userId, request.getProductId(), e);
            throw e;
        }
    }

    @PatchMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartItemDto>> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> body,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Integer quantity = body.get("quantity");
        
        if (quantity == null || quantity < 1) {
            log.warn("잘못된 수량 요청: 수량={}", quantity);
            throw new IllegalArgumentException("수량은 1 이상이어야 합니다.");
        }
        
        log.info("장바구니 수량 변경: 사용자={}, 항목ID={}, 새로운수량={}", userId, cartItemId, quantity);
        
        try {
            CartItemDto result = cartService.updateQuantity(cartItemId, quantity, userId);
            log.info("장바구니 수량 변경 완료: 항목ID={}", cartItemId);
            return ResponseEntity.ok(
                    ApiResponse.success("수량이 변경되었습니다.", result)
            );
        } catch (Exception e) {
            log.error("장바구니 수량 변경 실패: 항목ID={}, 사용자={}", cartItemId, userId, e);
            throw e;
        }
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @PathVariable Long cartItemId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("장바구니 항목 삭제: 사용자={}, 항목ID={}", userId, cartItemId);
        
        try {
            cartService.removeItem(cartItemId, userId);
            log.info("장바구니 항목 삭제 완료: 항목ID={}", cartItemId);
            return ResponseEntity.ok(
                    ApiResponse.success("상품이 장바구니에서 제거되었습니다.", null)
            );
        } catch (Exception e) {
            log.error("장바구니 항목 삭제 실패: 항목ID={}, 사용자={}", cartItemId, userId, e);
            throw e;
        }
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("장바구니 전체 비우기: 사용자={}", userId);
        
        try {
            cartService.clearCart(userId);
            log.info("장바구니 전체 비우기 완료: 사용자={}", userId);
            return ResponseEntity.ok(
                    ApiResponse.success("장바구니가 비워졌습니다.", null)
            );
        } catch (Exception e) {
            log.error("장바구니 비우기 실패: 사용자={}", userId, e);
            throw e;
        }
    }
}
