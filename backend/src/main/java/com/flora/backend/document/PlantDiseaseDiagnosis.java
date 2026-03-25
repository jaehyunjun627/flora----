package com.flora.backend.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "plant_disease_diagnoses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlantDiseaseDiagnosis {

    @Id
    private String id;

    private Long userId;       // Oracle USERS.id 참조

    private String plantId;    // MongoDB plants._id 참조

    private String imageUrl;

    private Map<String, Object> aiResult;

    private List<Map<String, Object>> prescriptions;

    private LocalDateTime diagnosedAt;
}
