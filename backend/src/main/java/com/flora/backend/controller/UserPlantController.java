package com.flora.backend.controller;

import com.flora.backend.document.UserPlant;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.UserRepository;
import com.flora.backend.service.UserPlantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-plants")
@RequiredArgsConstructor
public class UserPlantController {

    private final UserPlantService userPlantService;
    private final UserRepository userRepository;

    private User getUser(Authentication auth) {
        try {
            Long userId = Long.parseLong(auth.getName());
            return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        } catch (NumberFormatException e) {
            return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        }
    }

    // ── 식물 등록 신청 (로그인 필수) ──
    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(
            @RequestBody UserPlant plant,
            Authentication auth) {
        User user = getUser(auth);
        Map<String, Object> result = userPlantService.submit(plant, user);
        if (Boolean.FALSE.equals(result.get("success"))) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    // ── 승인된 식물 공개 목록 (비로그인 포함 누구나) ──
    @GetMapping("/approved")
    public ResponseEntity<List<UserPlant>> getApprovedPlants() {
        return ResponseEntity.ok(userPlantService.getApprovedPlants());
    }

    // ── 내 등록 식물 목록 ──
    @GetMapping("/my")
    public ResponseEntity<List<UserPlant>> getMyPlants(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(userPlantService.getMyPlants(user.getId()));
    }

    // ── 전체 목록 (관리자) ──
    @GetMapping("/admin")
    public ResponseEntity<List<UserPlant>> getAllPlants(Authentication auth) {
        User user = getUser(auth);
        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userPlantService.getAllPlants());
    }

    // ── 승인 (관리자) ──
    @PatchMapping("/{id}/approve")
    public ResponseEntity<UserPlant> approve(@PathVariable String id, Authentication auth) {
        User user = getUser(auth);
        if (!"ADMIN".equals(user.getRole())) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(userPlantService.approve(id));
    }

    // ── 내 식물 삭제 ──
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMyPlant(@PathVariable String id, Authentication auth) {
        User user = getUser(auth);
        try {
            userPlantService.deleteMyPlant(id, user.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }

    // ── 반려 (관리자) ──
    @PatchMapping("/{id}/reject")
    public ResponseEntity<UserPlant> reject(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        User user = getUser(auth);
        if (!"ADMIN".equals(user.getRole())) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(userPlantService.reject(id, body.get("reason")));
    }
}
