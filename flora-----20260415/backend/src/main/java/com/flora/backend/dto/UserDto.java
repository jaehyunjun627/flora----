package com.flora.backend.dto;

import com.flora.backend.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDto {
    private Long id;

    @NotBlank @Email
    private String email;

    @Size(min = 6)
    private String password;

    @Size(min = 2, max = 20)
    private String nickname;

    private String phone;
    private String profileImageUrl;
    private String profileEmoji;
    private String role;
    private Integer points;
    private Integer streakDays;
    private String farmName;
    private String businessName;
    private String businessNumber;
    private String oauthProvider;
    private String badges;
    private Boolean termsAgreed;
    private LocalDateTime termsAgreedAt;
    private Boolean privacyAgreed;
    private Boolean marketingAgreed;
    private String agreedTerms;

    // 인증 응답용
    private String token;

    public static UserDto from(User u) {
        return UserDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .nickname(u.getNickname())
                .phone(u.getPhone())
                .profileImageUrl(u.getProfileImageUrl())
                .profileEmoji(u.getProfileEmoji())
                .role(u.getRole())
                .points(u.getPoints())
                .streakDays(u.getStreakDays())
                .farmName(u.getFarmName())
                .businessName(u.getBusinessName())
                .businessNumber(u.getBusinessNumber())
                .oauthProvider(u.getOauthProvider())
                .badges(u.getBadges())
                .termsAgreed(u.getTermsAgreed())
                .privacyAgreed(u.getPrivacyAgreed())
                .marketingAgreed(u.getMarketingAgreed())
                .agreedTerms(u.getAgreedTerms())
                .build();
    }
}
