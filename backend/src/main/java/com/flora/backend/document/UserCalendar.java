package com.flora.backend.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB: 유저별 식물 목록 + AI 생성 일정(events) 영구 저장소.
 * 프론트 MyCalendar의 plants/events 구조를 그대로 저장해 로컬스토리지 의존을 제거한다.
 */
@Document(collection = "user_calendar")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserCalendar {
    @Id
    private String id;

    @Indexed(unique = true)
    private Long userId;

    @Builder.Default
    private List<PlantEntry> plants = new ArrayList<>();

    @Builder.Default
    private List<EventEntry> events = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PlantEntry {
        private Long id;            // 프론트 Date.now() 기반 id
        private String name;
        private String nickname;
        private String plantType;
        private LocalDateTime addedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EventEntry {
        private Long id;             // 프론트 Date.now()+n 기반 id
        private Long plantId;        // nullable
        private String plantName;
        private String type;         // WATERING / REPOTTING / FERTILIZING / PRUNING / CUSTOM
        private String title;
        private String date;         // yyyy-MM-dd
        @Builder.Default
        private Boolean isCompleted = false;
        @Builder.Default
        private Boolean isAiGenerated = false;

        /** 사용자가 일정에 남기는 자유 메모 (날짜 무관하게 언제든 수정 가능) */
        private String memo;
    }
}
