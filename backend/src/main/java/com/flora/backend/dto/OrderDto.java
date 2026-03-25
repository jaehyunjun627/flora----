package com.flora.backend.dto;

import com.flora.backend.entity.Order;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
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

    private LocalDateTime orderedAt;

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
                .productName(o.getProduct() != null ? o.getProduct().getName() : null)
                .quantity(o.getQuantity())
                .unitPrice(o.getUnitPrice())
                .pgTransactionId(o.getPgTransactionId())
                .paymentMethod(o.getPaymentMethod())
                .paymentStatus(o.getPaymentStatus())
                .paidAt(o.getPaidAt())
                .orderedAt(o.getOrderedAt())
                .build();
    }
}
