package com.flora.backend.dto;

import com.flora.backend.entity.Order;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String status;
    private BigDecimal totalPrice;
    private String deliveryAddress;
    private String recipientName;
    private String recipientPhone;
    private LocalDateTime orderedAt;
    private List<OrderItemResponse> items;

    @Getter
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    public static OrderResponse from(Order o) {
        List<OrderItemResponse> items = o.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus())
                .totalPrice(o.getTotalPrice())
                .deliveryAddress(o.getDeliveryAddress())
                .recipientName(o.getRecipientName())
                .recipientPhone(o.getRecipientPhone())
                .orderedAt(o.getOrderedAt())
                .items(items)
                .build();
    }
}
