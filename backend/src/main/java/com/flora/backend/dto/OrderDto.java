package com.flora.backend.dto;

import com.flora.backend.entity.Order;
import com.flora.backend.entity.OrderItem;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    // 대표 상품 (첫 번째 아이템 / SellerService 호환용)
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;

    // 전체 주문 아이템 목록
    private List<ItemDto> items;

    @Getter @Builder
    public static class ItemDto {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;

        public static ItemDto from(OrderItem item) {
            return ItemDto.builder()
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .build();
        }
    }

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
                .items(o.getItems().stream().map(ItemDto::from).collect(Collectors.toList()))
                .build();
    }
}
