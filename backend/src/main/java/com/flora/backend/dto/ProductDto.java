package com.flora.backend.dto;

import com.flora.backend.entity.Product;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductDto {
    private Long id;
    private Long sellerId;
    private String sellerNickname;
    private String plantId;

    @NotBlank
    private String name;

    private String description;
    private String imageUrl;

    @NotNull @Positive
    private BigDecimal price;

    private BigDecimal originalPrice;
    private Integer stockQuantity;

    @NotBlank
    private String category;

    private String productType;
    private Boolean isGroupBuy;
    private Integer groupBuyCurrent;
    private BigDecimal rating;
    private Integer reviewCount;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static ProductDto from(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .sellerId(p.getSeller() != null ? p.getSeller().getId() : null)
                .sellerNickname(p.getSeller() != null ? p.getSeller().getNickname() : null)
                .plantId(p.getPlantId())
                .name(p.getName())
                .description(p.getDescription())
                .imageUrl(p.getImageUrl())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .stockQuantity(p.getStockQuantity())
                .category(p.getCategory())
                .productType(p.getProductType())
                .isGroupBuy(p.getIsGroupBuy())
                .groupBuyCurrent(p.getGroupBuyCurrent())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .isActive(p.getIsActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
