package com.flora.backend.dto;

import com.flora.backend.entity.CartItem;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItemDto {
    private Long id;

    @NotNull
    private Long productId;

    private String productName;
    private BigDecimal productPrice;
    private String productCategory;
    private Integer stockQuantity;

    @Min(1)
    @Builder.Default
    private Integer quantity = 1;

    private BigDecimal subtotal;
    private LocalDateTime addedAt;

    public static CartItemDto from(CartItem c) {
        BigDecimal sub = c.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(c.getQuantity()));
        return CartItemDto.builder()
                .id(c.getId())
                .productId(c.getProduct().getId())
                .productName(c.getProduct().getName())
                .productPrice(c.getProduct().getPrice())
                .productCategory(c.getProduct().getCategory())
                .stockQuantity(c.getProduct().getStockQuantity())
                .quantity(c.getQuantity())
                .subtotal(sub)
                .addedAt(c.getAddedAt())
                .build();
    }
}
