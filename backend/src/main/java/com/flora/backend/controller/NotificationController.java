package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.UserRepository;
import com.flora.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    private Long getUserId(String token) {
        return jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
    }

    // 읽지 않은 알림 수
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("Authorization") String token) {
        long count = notificationService.getUnreadCount(getUserId(token));
        return ResponseEntity.ok(Map.of("count", count));
    }

    // 알림 목록
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(notificationService.getNotifications(getUserId(token)));
    }

    // 단일 알림 읽음
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        notificationService.markAsRead(id, getUserId(token));
        return ResponseEntity.ok().build();
    }

    // 전체 읽음
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader("Authorization") String token) {
        notificationService.markAllAsRead(getUserId(token));
        return ResponseEntity.ok().build();
    }

    // 알림 생성 (프론트에서 직접 호출)
    @PostMapping
    public ResponseEntity<Void> createNotification(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> body) {
        Long userId = getUserId(token);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().build();

        String type = body.getOrDefault("type", "SUBSCRIPTION");
        String message = body.getOrDefault("message", "");
        String relatedType = body.getOrDefault("relatedType", "SUBSCRIPTION");
        Long relatedId = null;
        try { relatedId = Long.parseLong(body.getOrDefault("relatedId", "0")); } catch (Exception ignored) {}

        notificationService.create(user, type, message, relatedId, relatedType);
        return ResponseEntity.ok().build();
    }
}
