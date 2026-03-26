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

    private String name;              // 한국어 이름
    private String scientificName;     // 학명
    private String engName;            // 영문 이름
    private String familyKorName;      // 과명 (예: 장미과)
    private String orderKorName;       // 목명 (예: 장미목)

    private String birthFlowerDate;    // 탄생화 날짜
    private String flowerLanguage;     // 꽃말
    private String season;             // 계절 (봄, 여름, 가을, 겨울, 사계절)
    private String description;        // 설명
    private String habitat;            // 서식지/재배 장소
    private String toxicity;           // 독성 정보 ("없음" 또는 "있음 (상세)")

    private Boolean isToxicToPets;     // 반려동물 독성 여부

    private Map<String, Object> careInfo;  // 물주기, 햇빛, 온도 등

    private List<Map<String, Object>> commonDiseases;

    private List<String> tags;

    private List<String> companions;
}
