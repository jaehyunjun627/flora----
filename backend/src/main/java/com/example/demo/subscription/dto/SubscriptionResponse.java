package com.example.demo.subscription.dto;

import com.example.demo.subscription.entity.Subscription;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
public class SubscriptionResponse {
    private Long id;
    private Long userId;
    private String planType;
    private String status;
    private LocalDate startDate;
    private LocalDate nextBillingDate;
    private String deliveryAddress;
    private String receiverName;
    private String receiverPhone;
    private boolean seasonalFlower;

    public static SubscriptionResponse from(Subscription s) {
        return SubscriptionResponse.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .planType(s.getPlanType().name())
                .status(s.getStatus().name())
                .startDate(s.getStartDate())
                .nextBillingDate(s.getNextBillingDate())
                .deliveryAddress(s.getDeliveryAddress())
                .receiverName(s.getReceiverName())
                .receiverPhone(s.getReceiverPhone())
                .seasonalFlower(s.isSeasonalFlower())
                .build();
    }
}
