package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {
    private final MyPageService myPageService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<?> getMyPage(@RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(myPageService.getMyPage(userId));
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(@RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(myPageService.checkIn(userId));
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body,
                                           @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(myPageService.updateProfile(userId, body.get("nickname"), body.get("phone"), body.get("profileEmoji")));
    }

    private Long extractUserId(String token) {
        if (token == null || !token.startsWith("Bearer ")) return null;
        try { return jwtTokenProvider.getUserId(token.substring(7)); } catch (Exception e) { return null; }
    }
}
