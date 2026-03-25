package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "pg_transaction_id", length = 100)
    private String pgTransactionId;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 20)
    private String method;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
