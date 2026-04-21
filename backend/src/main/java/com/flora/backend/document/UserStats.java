package com.flora.backend.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB: 유저의 게이미피케이션 지표(출석/포인트/뱃지/게이지) 저장소.
 * Oracle User 엔티티와 분리하여 이력(출석일 목록, 뱃지 획득일)을 풍부하게 기록.
 */
@Document(collection = "user_stats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserStats {
    @Id
    private String id;

    @Indexed(unique = true)
    private Long userId;

    @Builder.Default
    private Integer points = 0;

    @Builder.Default
    private Integer streakDays = 0;

    /** 레벨 게이지: 현재 레벨 구간 내 진행률(0~100). 단순히 포인트 기반으로 계산해도 되지만 저장해둠. */
    @Builder.Default
    private Integer gauge = 0;

    /** 마지막 출석일 (yyyy-MM-dd 기준) */
    private LocalDate lastCheckIn;

    /** 출석한 날짜 목록 (ISO-8601: yyyy-MM-dd) */
    @Builder.Default
    private List<String> attendanceDates = new ArrayList<>();

    /** 획득한 뱃지 정보 */
    @Builder.Default
    private List<BadgeRecord> badges = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BadgeRecord {
        private String code;        // SPROUT / BUD / BLOOM / LEAF / MASTER ...
        private String name;        // 새싹 / 꽃봉오리 ...
        private LocalDateTime earnedAt;
    }
}
