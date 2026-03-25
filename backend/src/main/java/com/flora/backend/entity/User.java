package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "USERS")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(length = 30)
    private String nickname;

    @Column(length = 20)
    private String phone;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "profile_emoji", length = 10)
    private String profileEmoji;

    @Column(length = 20)
    @Builder.Default
    private String role = "USER";

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Integer points = 0;

    @Column(name = "streak_days")
    @Builder.Default
    private Integer streakDays = 0;

    @Column(name = "last_check_in")
    private LocalDate lastCheckIn;

    @Column(name = "farm_name", length = 50)
    private String farmName;

    @Column(name = "seller_status", length = 20)
    private String sellerStatus;

    @Column(name = "business_name", length = 100)
    private String businessName;

    @Column(name = "business_number", length = 20)
    private String businessNumber;

    // === OauthAccount 통합 ===
    @Column(name = "oauth_provider", length = 20)
    private String oauthProvider;

    @Column(name = "oauth_provider_user_id", length = 100)
    private String oauthProviderUserId;

    // === UserBadge 통합 (쉼표 구분 문자열) ===
    @Column(name = "badges", length = 500)
    private String badges;

    // === Term/UserTermConsent 통합 ===
    @Column(name = "terms_agreed")
    @Builder.Default
    private Boolean termsAgreed = false;

    @Column(name = "terms_agreed_at")
    private LocalDateTime termsAgreedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
