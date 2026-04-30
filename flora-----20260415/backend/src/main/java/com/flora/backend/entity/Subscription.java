package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "SUBSCRIPTIONS")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 20)
    private String plan;

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "next_delivery_date")
    private LocalDate nextDeliveryDate;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    // === AnniversaryDelivery 통합 ===
    @Column(name = "recipient_name", length = 30)
    private String recipientName;

    @Column(name = "anniversary_date")
    private LocalDate anniversaryDate;

    @Column(name = "handwritten_letter", columnDefinition = "CLOB")
    private String handwrittenLetter;

    @Column(name = "plant_id", length = 50)
    private String plantId;  // MongoDB 참조

    @Column(name = "subscribed_at")
    private LocalDateTime subscribedAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        subscribedAt = LocalDateTime.now();
    }
}
