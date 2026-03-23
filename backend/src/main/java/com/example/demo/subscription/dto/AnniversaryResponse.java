package com.example.demo.subscription.dto;

import com.example.demo.subscription.entity.Anniversary;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
public class AnniversaryResponse {
    private Long id;
    private Long subscriptionId;
    private String name;
    private LocalDate anniversaryDate;
    private boolean active;
    private int daysBefore;
    private String flowerNote;

    public static AnniversaryResponse from(Anniversary a) {
        return AnniversaryResponse.builder()
                .id(a.getId())
                .subscriptionId(a.getSubscription().getId())
                .name(a.getName())
                .anniversaryDate(a.getAnniversaryDate())
                .active(a.isActive())
                .daysBefore(a.getDaysBefore())
                .flowerNote(a.getFlowerNote())
                .build();
    }
}
