package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "MISSIONS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 200)
    private String description;

    // DAILY, WEEKLY, ONCE
    @Column(name = "mission_type", length = 10, nullable = false)
    private String missionType;

    // 미션 완료 조건 이벤트 키 (WATERING_DONE, DIARY_WRITTEN, CHECKIN, POST_WRITTEN)
    @Column(name = "event_key", length = 50, nullable = false)
    private String eventKey;

    @Column(name = "required_count", nullable = false)
    private Integer requiredCount;

    @Column(name = "reward_points", nullable = false)
    private Integer rewardPoints;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
