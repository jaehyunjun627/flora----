package com.flora.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String email;
    private String nickname;
    private String role;
}
