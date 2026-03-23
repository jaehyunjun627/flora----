package com.flora.backend.dto;

import com.flora.backend.entity.Product;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProductResponse {
    private Long id;
    private Long sellerId;
    private String sellerNickname;
    private String plantId;
    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer stockQuantity;
    private String category;
    private String productType;
    private Boolean isGroupBuy;
    private Integer groupBuyCurrent;
    private BigDecimal rating;
    private Integer reviewCount;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static ProductResponse from(Product p) {
        return ProductResponse.builder()
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
