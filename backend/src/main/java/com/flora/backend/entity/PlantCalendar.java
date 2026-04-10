package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PLANT_CALENDARS")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlantCalendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "plant_id", length = 50)
    private String plantId;  // MongoDB 참조

    @Column(name = "plant_nickname", length = 50)
    private String plantNickname;

    @Column(name = "watering_cycle_days")
    private Integer wateringCycleDays;

    @Column(name = "watering_next_date")
    private LocalDate wateringNextDate;

    @Column(name = "watering_is_done")
    @Builder.Default
    private Boolean wateringIsDone = false;

    @Column(name = "repot_date")
    private LocalDate repotDate;

    @Column(name = "fertilize_date")
    private LocalDate fertilizeDate;

    // === GrowthDiary 통합 ===
    @Column(name = "diary_memo", columnDefinition = "CLOB")
    private String diaryMemo;

    @Column(name = "diary_image_url")
    private String diaryImageUrl;

    @Column(name = "diary_recorded_date")
    private LocalDate diaryRecordedDate;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
