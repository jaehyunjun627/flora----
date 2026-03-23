package com.example.demo.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "SUBSCRIPTIONS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "plan", length = 20)
    private String plan;  // ex) MONTHLY, ANNUAL

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE";  // ACTIVE, PAUSED, CANCELLED

    @Column(name = "next_delivery_date")
    private LocalDate nextDeliveryDate;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "subscribed_at")
    private LocalDateTime subscribedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        subscribedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
