package com.flora.backend.dto;

import com.flora.backend.entity.Order;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderDto {
    private Long id;
    private String orderNumber;
    private String status;
    private BigDecimal totalPrice;

    @NotBlank
    private String deliveryAddress;

    @NotBlank
    private String recipientName;

    @NotBlank
    private String recipientPhone;

    // OrderItem 통합
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;

    // Payment 통합
    private String pgTransactionId;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime paidAt;

    // 배송 정보
    private String courierName;
    private String trackingNumber;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private String deliveryMemo;

    // 구매자 정보 (판매자 조회용)
    private String buyerNickname;
    private String buyerEmail;

    // 판매자 정보
    private Long sellerId;
    private String sellerNickname;

    private LocalDateTime orderedAt;

    // 예약 발송 (단일 구매)
    private LocalDate scheduledDeliveryDate;

    public static OrderDto from(Order o) {
        return OrderDto.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus())
                .totalPrice(o.getTotalPrice())
                .deliveryAddress(o.getDeliveryAddress())
                .recipientName(o.getRecipientName())
                .recipientPhone(o.getRecipientPhone())
                .productId(o.getProduct() != null ? o.getProduct().getId() : null)
                .productName(o.getProduct() != null
                        ? o.getProduct().getName()
                        : o.getManualProductName())
                .quantity(o.getQuantity())
                .unitPrice(o.getUnitPrice())
                .pgTransactionId(o.getPgTransactionId())
                .paymentMethod(o.getPaymentMethod())
                .paymentStatus(o.getPaymentStatus())
                .paidAt(o.getPaidAt())
                .courierName(o.getCourierName())
                .trackingNumber(o.getTrackingNumber())
                .shippedAt(o.getShippedAt())
                .deliveredAt(o.getDeliveredAt())
                .deliveryMemo(o.getDeliveryMemo())
                .buyerNickname(o.getUser() != null ? o.getUser().getNickname() : null)
                .buyerEmail(o.getUser() != null ? o.getUser().getEmail() : null)
                .sellerId(o.getProduct() != null && o.getProduct().getSeller() != null ? o.getProduct().getSeller().getId() : null)
                .sellerNickname(o.getProduct() != null && o.getProduct().getSeller() != null ? o.getProduct().getSeller().getNickname() : null)
                .orderedAt(o.getOrderedAt())
                .scheduledDeliveryDate(o.getScheduledDeliveryDate())
                .build();
    }
}
