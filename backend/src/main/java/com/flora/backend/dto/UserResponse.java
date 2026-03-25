package com.flora.backend.dto;

import com.flora.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String email;
    private String nickname;
    private String phone;
    private String profileImageUrl;
    private String profileEmoji;
    private String role;
    private Integer points;
    private Integer streakDays;
    private String farmName;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .profileEmoji(user.getProfileEmoji())
                .role(user.getRole())
                .points(user.getPoints())
                .streakDays(user.getStreakDays())
                .farmName(user.getFarmName())
                .build();
    }
}
