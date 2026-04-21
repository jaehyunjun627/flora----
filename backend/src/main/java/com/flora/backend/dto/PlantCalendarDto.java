package com.flora.backend.dto;

import com.flora.backend.entity.PlantCalendar;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlantCalendarDto {
    private Long id;
    private String plantId;
    private String plantNickname;
    private Integer wateringCycleDays;
    private LocalDate wateringNextDate;
    private Boolean wateringIsDone;
    private LocalDate repotDate;
    private LocalDate fertilizeDate;

    // GrowthDiary 통합
    private String diaryMemo;
    private String diaryImageUrl;
    private LocalDate diaryRecordedDate;

    private LocalDateTime createdAt;

    public static PlantCalendarDto from(PlantCalendar pc) {
        return PlantCalendarDto.builder()
                .id(pc.getId())
                .plantId(pc.getPlantId())
                .plantNickname(pc.getPlantNickname())
                .wateringCycleDays(pc.getWateringCycleDays())
                .wateringNextDate(pc.getWateringNextDate())
                .wateringIsDone(pc.getWateringIsDone())
                .repotDate(pc.getRepotDate())
                .fertilizeDate(pc.getFertilizeDate())
                .diaryMemo(pc.getDiaryMemo())
                .diaryImageUrl(pc.getDiaryImageUrl())
                .diaryRecordedDate(pc.getDiaryRecordedDate())
                .createdAt(pc.getCreatedAt())
                .build();
    }
}
