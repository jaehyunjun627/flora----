package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "FESTIVALS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Festival {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 10)
    private String emoji;

    @Column(length = 50)
    private String region;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "CLOB")
    private String description;

    @Column(name = "bg_color", length = 20)
    private String bgColor;

    // --- 위치 / 관광공사 API 연동 확장 필드 ---
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    /** 상세 주소 (네이버 지도 검색용) */
    @Column(length = 200)
    private String address;

    /** 관광공사 콘텐츠 상세 페이지 / 공식 홈페이지 URL */
    @Column(name = "detail_url", length = 500)
    private String detailUrl;

    /** 대표 이미지 URL (관광공사 firstimage) */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** 한국관광공사 contentid (중복 방지용) */
    @Column(name = "content_id", length = 50, unique = true)
    private String contentId;
}
