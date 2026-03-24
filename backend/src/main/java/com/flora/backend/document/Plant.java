package com.flora.backend.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "plants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Plant {

    @Id
    private String id;

    private String name;

    private String scientificName;

    private String birthFlowerDate;

    private String flowerLanguage;

    private Boolean isToxicToPets;

    private Map<String, Object> careInfo;  // 물주기, 햇빛, 온도 등

    private List<Map<String, Object>> commonDiseases;

    private List<String> tags;

    private List<String> companions;
}
