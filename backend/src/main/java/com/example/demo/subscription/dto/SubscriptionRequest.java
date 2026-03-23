package com.example.demo.subscription.dto;

import com.example.demo.subscription.entity.Subscription.PlanType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubscriptionRequest {
    private Long userId;
    private PlanType planType;
    private String deliveryAddress;
    private String receiverName;
    private String receiverPhone;
    private boolean seasonalFlower;
}
