package com.flora.backend.dto;

import com.flora.backend.entity.ProductReview;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductReviewDto {
    private Long id;
    private Long productId;
    private Long userId;
    private String userNickname;
    private String userProfileEmoji;
    private Integer rating;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;

    public static ProductReviewDto from(ProductReview r) {
        return ProductReviewDto.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .userId(r.getUser().getId())
                .userNickname(r.getUser().getNickname())
                .userProfileEmoji(r.getUser().getProfileEmoji())
                .rating(r.getRating())
                .content(r.getContent())
                .imageUrl(r.getImageUrl())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
