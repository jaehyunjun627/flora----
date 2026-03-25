package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_BADGES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "badge_code", length = 30)
    private String badgeCode;

    @Column(name = "badge_name", length = 50)
    private String badgeName;

    @Column(name = "earned_at")
    private LocalDateTime earnedAt;

    @PrePersist
    protected void onCreate() {
        earnedAt = LocalDateTime.now();
    }
}
