package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ANNIVERSARY_DELIVERIES")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnniversaryDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @Column(name = "recipient_name", length = 30)
    private String recipientName;

    @Column(name = "anniversary_date")
    private LocalDate anniversaryDate;

    @Column(name = "handwritten_letter", columnDefinition = "CLOB")
    private String handwrittenLetter;

    @Column(name = "plant_id", length = 50)
    private String plantId;  // MongoDB 참조

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING";

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
