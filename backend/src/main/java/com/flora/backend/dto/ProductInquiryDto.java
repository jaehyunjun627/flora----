package com.flora.backend.dto;

import com.flora.backend.entity.ProductInquiry;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductInquiryDto {
    private Long id;
    private Long productId;
    private Long userId;
    private String userNickname;
    private String title;
    private String content;       // 비밀글이면 본인/판매자만
    private Boolean isSecret;
    private Boolean isAnswered;
    private String answer;
    private LocalDateTime answeredAt;
    private LocalDateTime createdAt;
    private boolean myInquiry;    // 내 문의 여부 (프론트용)

    public static ProductInquiryDto from(ProductInquiry q, Long currentUserId, boolean isSeller) {
        boolean isMine = q.getUser().getId().equals(currentUserId);
        boolean canSeeContent = !q.getIsSecret() || isMine || isSeller;

        return ProductInquiryDto.builder()
                .id(q.getId())
                .productId(q.getProduct().getId())
                .userId(q.getUser().getId())
                .userNickname(q.getIsSecret() && !isMine && !isSeller
                    ? q.getUser().getNickname().charAt(0) + "**"
                    : q.getUser().getNickname())
                .title(q.getIsSecret() && !canSeeContent ? "🔒 비밀글입니다" : q.getTitle())
                .content(canSeeContent ? q.getContent() : null)
                .isSecret(q.getIsSecret())
                .isAnswered(q.getIsAnswered())
                .answer(q.getIsAnswered() ? q.getAnswer() : null)
                .answeredAt(q.getAnsweredAt())
                .createdAt(q.getCreatedAt())
                .myInquiry(isMine)
                .build();
    }
}
