package com.flora.backend.controller;

import com.flora.backend.dto.ApiResponse;
import com.flora.backend.dto.UserDto;
import com.flora.backend.entity.User;
import com.flora.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserDto>> signup(@Valid @RequestBody UserDto request) {
        log.info("회원가입 요청: {}", request.getEmail());
        try {
            UserDto result = authService.signup(request);
            log.info("회원가입 성공: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("회원가입이 완료되었습니다.", result)
            );
        } catch (Exception e) {
            log.error("회원가입 실패: {}", request.getEmail(), e);
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto>> login(@RequestBody UserDto request) {
        log.info("로그인 요청: {}", request.getEmail());
        try {
            UserDto result = authService.login(request);
            log.info("로그인 성공: {} (사용자ID: {})", request.getEmail(), result.getId());
            return ResponseEntity.ok(
                    ApiResponse.success("로그인 성공했습니다.", result)
            );
        } catch (Exception e) {
            log.warn("로그인 실패: {}", request.getEmail());
            throw e;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMe(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.debug("사용자 정보 조회: {}", userId);
        
        User user = authService.getUserById(userId);
        return ResponseEntity.ok(
                ApiResponse.success("사용자 정보 조회 성공", UserDto.from(user))
        );
    }

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEmail(@RequestParam String email) {
        log.debug("이메일 중복 확인: {}", email);
        boolean available = !authService.existsByEmail(email);
        return ResponseEntity.ok(
                ApiResponse.success(Map.of("available", available))
        );
    }
}
