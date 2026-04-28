package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_MISSION_PROGRESS",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "mission_id", "period_key"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserMissionProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    // DAILY: yyyy-MM-dd, WEEKLY: yyyy-Www, ONCE: ONCE
    @Column(name = "period_key", length = 20, nullable = false)
    private String periodKey;

    @Column(name = "current_count")
    @Builder.Default
    private Integer currentCount = 0;

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "is_rewarded")
    @Builder.Default
    private Boolean isRewarded = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
