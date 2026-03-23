package com.example.demo.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "anniversaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Anniversary {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "anniversary_seq")
    @SequenceGenerator(name = "anniversary_seq", sequenceName = "anniversary_seq", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    // 기념일 이름 (예: 결혼기념일, 생일, 어버이날)
    @Column(name = "name", nullable = false)
    private String name;

    // 매년 반복되는 날짜 (월-일 기준)
    @Column(name = "anniversary_date", nullable = false)
    private LocalDate anniversaryDate;

    // 기념일 챙기기 활성화 여부
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    // 꽃 배송 며칠 전에 보낼지 (기본 당일)
    @Column(name = "days_before")
    @Builder.Default
    private int daysBefore = 0;

    // 원하는 꽃 스타일 메모
    @Column(name = "flower_note")
    private String flowerNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
