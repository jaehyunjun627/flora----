package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "POSTS")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "CLOB")
    private String content;

    // COMMUNITY, NOTICE, QNA 등
    @Column(length = 30)
    private String category;

    @Column(name = "location_city", length = 50)
    private String locationCity;

    // GPS 좌표 (지역거래, 지역축제 카테고리)
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    // === Like 통합 (카운터) ===
    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    // === Notice 통합 ===
    @Column(name = "is_pinned")
    @Builder.Default
    private Boolean isPinned = false;

    @Column(length = 20)
    private String tag;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
