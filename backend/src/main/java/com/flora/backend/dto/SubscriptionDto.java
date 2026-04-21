package com.flora.backend.dto;

import com.flora.backend.entity.Subscription;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubscriptionDto {
    private Long id;
    private String plan;
    private String status;
    private LocalDate nextDeliveryDate;
    private String deliveryAddress;

    // AnniversaryDelivery 통합
    private String recipientName;
    private LocalDate anniversaryDate;
    private String handwrittenLetter;
    private String plantId;

    private LocalDateTime subscribedAt;

    public static SubscriptionDto from(Subscription s) {
        return SubscriptionDto.builder()
                .id(s.getId())
                .plan(s.getPlan())
                .status(s.getStatus())
                .nextDeliveryDate(s.getNextDeliveryDate())
                .deliveryAddress(s.getDeliveryAddress())
                .recipientName(s.getRecipientName())
                .anniversaryDate(s.getAnniversaryDate())
                .handwrittenLetter(s.getHandwrittenLetter())
                .plantId(s.getPlantId())
                .subscribedAt(s.getSubscribedAt())
                .build();
    }
}
