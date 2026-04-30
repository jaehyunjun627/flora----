package com.flora.backend.dto;

import com.flora.backend.entity.Festival;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FestivalDto {
    private Long id;
    private String name;
    private String emoji;
    private String region;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String bgColor;
    private Double latitude;
    private Double longitude;
    private String address;
    private String detailUrl;
    private String imageUrl;
    private String contentId;

    public static FestivalDto from(Festival f) {
        return FestivalDto.builder()
                .id(f.getId())
                .name(f.getName())
                .emoji(f.getEmoji())
                .region(f.getRegion())
                .startDate(f.getStartDate())
                .endDate(f.getEndDate())
                .description(f.getDescription())
                .bgColor(f.getBgColor())
                .latitude(f.getLatitude())
                .longitude(f.getLongitude())
                .address(f.getAddress())
                .detailUrl(f.getDetailUrl())
                .imageUrl(f.getImageUrl())
                .contentId(f.getContentId())
                .build();
    }
}
