package com.flora.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
public class ProductRequest {

    @NotBlank(message = "상품명을 입력해주세요")
    private String name;

    @NotNull(message = "가격을 입력해주세요")
    @Positive(message = "가격은 0보다 커야 합니다")
    private BigDecimal price;

    private BigDecimal originalPrice;

    private Integer stockQuantity = 0;

    @NotBlank(message = "카테고리를 선택해주세요")
    private String category;

    private String description;
    private String imageUrl;
    private String productType;
    private String plantId;
    private Boolean isGroupBuy = false;
}
