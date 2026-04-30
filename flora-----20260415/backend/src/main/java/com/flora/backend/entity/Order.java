package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ORDERS")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "order_number", unique = true, length = 30)
    private String orderNumber;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "recipient_name", length = 30)
    private String recipientName;

    @Column(name = "recipient_phone", length = 20)
    private String recipientPhone;

    // === OrderItem 통합 (단일 상품 주문) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    // === Payment 통합 ===
    @Column(name = "pg_transaction_id", length = 100)
    private String pgTransactionId;

    @Column(name = "payment_method", length = 20)
    private String paymentMethod;

    @Column(name = "payment_status", length = 20)
    @Builder.Default
    private String paymentStatus = "PENDING";

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // === 배송 정보 ===
    @Column(name = "courier_name", length = 30)
    private String courierName;

    @Column(name = "tracking_number", length = 50)
    private String trackingNumber;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "delivery_memo")
    private String deliveryMemo;

    // === 예약 발송 (단일 구매: 사용자가 지정한 배송 희망일) ===
    @Column(name = "scheduled_delivery_date")
    private LocalDate scheduledDeliveryDate;

    // 상품 엔티티가 연결되지 않는 주문(예약 발송, 구독)의 상품명 보관용
    @Column(name = "manual_product_name", length = 100)
    private String manualProductName;

    @CreatedDate
    @Column(name = "ordered_at", updatable = false)
    private LocalDateTime orderedAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
