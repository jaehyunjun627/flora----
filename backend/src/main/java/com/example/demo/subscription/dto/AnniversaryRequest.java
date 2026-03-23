package com.example.demo.subscription.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class AnniversaryRequest {
    private String name;
    private LocalDate anniversaryDate;
    private boolean active;
    private int daysBefore;
    private String flowerNote;
}
