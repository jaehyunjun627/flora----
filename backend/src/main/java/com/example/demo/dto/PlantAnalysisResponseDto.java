package com.example.demo.dto;

import lombok.Data;

@Data
public class PlantAnalysisResponseDto {
    private Integer wateringInterval;      // 물주기 주기 (일)
    private Integer repottingInterval;     // 분갈이 주기 (일)
    private Integer fertilizingInterval;   // 비료 주기 (일, null 가능)
    private Integer pruningInterval;       // 가지치기 주기 (일, null 가능)
    private String careNotes;              // 케어 주의사항
}
