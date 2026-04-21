package com.flora.backend.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "user_plants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPlant {

    @Id
    private String id;

    // 등록자 정보
    private Long userId;
    private String userNickname;

    // 식물 기본 정보 (필수)
    private String name;           // 식물 이름 (필수)
    private String scientificName; // 학명 (선택)
    private String engName;        // 영어 이름 (선택)
    private String flowerLanguage; // 꽃말 (선택)
    private String familyKorName;  // 과명 (선택)
    private String orderKorName;   // 목명 (선택)
    private String season;         // 계절 (필수)
    private String description;    // 설명 (필수, 최소 20자)
    private String habitat;        // 서식지 (선택)

    // 독성 (필수)
    private String toxicity;       // "없음" or "있음"
    private Boolean isToxicToPets; // 반려동물 독성

    // 관리법 (물주기/햇빛 필수)
    private Map<String, Object> careInfo;

    // 이미지
    private String imageUrl;

    // AI 검증 결과
    private String status;               // PENDING, APPROVED, REJECTED
    private List<String> validationErrors; // 검증 실패 항목들
    private String rejectionReason;

    @CreatedDate
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
