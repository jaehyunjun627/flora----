package com.example.demo.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ANNIVERSARY_DELIVERIES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Anniversary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @Column(name = "recipient_name", length = 30)
    private String recipientName;

    @Column(name = "anniversary_date")
    private LocalDate anniversaryDate;

    @Lob
    @Column(name = "handwritten_letter")
    private String handwrittenLetter;

    @Column(name = "plant_id", length = 50)
    private String plantId;  // MongoDB plants._id 참조

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING";  // PENDING, CONFIRMED, SHIPPED, DELIVERED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
