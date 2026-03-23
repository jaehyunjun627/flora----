package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "special_missions")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "special_mission_id")
    private Long specialMissionId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "points")
    @Builder.Default
    private Integer points = 30;

    @Column(name = "icon", length = 100)
    private String icon;

    /**
     * 날짜 기반 순환 인덱스 (MOD(dayOfYear, totalCount))로 오늘의 특별 미션 결정
     */
    @Column(name = "day_index", nullable = false, unique = true)
    private Integer dayIndex;
}
