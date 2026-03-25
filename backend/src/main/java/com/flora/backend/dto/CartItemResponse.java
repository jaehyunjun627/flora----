package com.flora.backend.dto;

import com.flora.backend.entity.CartItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal productPrice;
    private String productCategory;
    private Integer stockQuantity;
    private Integer quantity;
    private BigDecimal subtotal;
    private LocalDateTime addedAt;

    public static CartItemResponse from(CartItem c) {
        BigDecimal subtotal = c.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(c.getQuantity()));
        return CartItemResponse.builder()
                .id(c.getId())
                .productId(c.getProduct().getId())
                .productName(c.getProduct().getName())
                .productPrice(c.getProduct().getPrice())
                .productCategory(c.getProduct().getCategory())
                .stockQuantity(c.getProduct().getStockQuantity())
                .quantity(c.getQuantity())
                .subtotal(subtotal)
                .addedAt(c.getAddedAt())
                .build();
    }
}
