package com.flora.backend.service;

import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MyPageService {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public Map<String, Object> getMyPage(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        String grade = getGrade(user.getStreakDays(), orderRepository.countByUserId(userId));

        // badges 문자열을 리스트로 변환
        List<Map<String, Object>> badgeList = new ArrayList<>();
        if (user.getBadges() != null && !user.getBadges().isBlank()) {
            for (String badge : user.getBadges().split(",")) {
                String trimmed = badge.trim();
                Map<String, Object> bMap = new HashMap<>();
                bMap.put("badgeCode", trimmed);
                bMap.put("badgeName", getBadgeName(trimmed));
                badgeList.add(bMap);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("email", user.getEmail());
        result.put("nickname", user.getNickname());
        result.put("phone", user.getPhone());
        result.put("profileEmoji", user.getProfileEmoji() != null ? user.getProfileEmoji() : "🌿");
        result.put("role", user.getRole());
        result.put("points", user.getPoints());
        result.put("streakDays", user.getStreakDays());
        result.put("lastCheckIn", user.getLastCheckIn());
        result.put("grade", grade);
        result.put("badges", badgeList);
        result.put("createdAt", user.getCreatedAt());
        return result;
    }

    @Transactional
    public Map<String, Object> checkIn(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        LocalDate today = LocalDate.now();
        if (today.equals(user.getLastCheckIn())) {
            return Map.of("message", "오늘 이미 출석했습니다", "alreadyCheckedIn", true, "streakDays", user.getStreakDays());
        }
        if (user.getLastCheckIn() != null && user.getLastCheckIn().plusDays(1).equals(today)) {
            user.setStreakDays(user.getStreakDays() + 1);
        } else {
            user.setStreakDays(1);
        }
        user.setLastCheckIn(today);
        user.setPoints(user.getPoints() + 5);

        // 뱃지 체크 (User.badges 필드에 저장)
        checkAndAwardBadge(user);
        userRepository.save(user);

        return Map.of("message", "출석 완료! +5 포인트", "alreadyCheckedIn", false,
            "streakDays", user.getStreakDays(), "points", user.getPoints());
    }

    @Transactional
    public Map<String, Object> updateProfile(Long userId, String nickname, String phone, String profileEmoji) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        if (nickname != null && !nickname.isBlank()) user.setNickname(nickname);
        if (phone != null && !phone.isBlank()) user.setPhone(phone);
        if (profileEmoji != null && !profileEmoji.isBlank()) user.setProfileEmoji(profileEmoji);
        userRepository.save(user);
        return Map.of("message", "프로필이 수정되었습니다");
    }

    private void checkAndAwardBadge(User user) {
        long orderCount = orderRepository.countByUserId(user.getId());
        String badges = user.getBadges() != null ? user.getBadges() : "";

        if (user.getStreakDays() >= 10 && orderCount >= 1 && !badges.contains("SPROUT")) {
            badges = badges.isEmpty() ? "SPROUT" : badges + ",SPROUT";
        }
        if (user.getStreakDays() >= 30 && orderCount >= 5 && !badges.contains("BUD")) {
            badges = badges.isEmpty() ? "BUD" : badges + ",BUD";
        }
        if (user.getStreakDays() >= 60 && orderCount >= 10 && !badges.contains("BLOOM")) {
            badges = badges.isEmpty() ? "BLOOM" : badges + ",BLOOM";
        }
        user.setBadges(badges);
    }

    private String getBadgeName(String code) {
        return switch (code) {
            case "SPROUT" -> "새싹";
            case "BUD" -> "꽃봉오리";
            case "BLOOM" -> "만개";
            default -> code;
        };
    }

    private String getGrade(int streakDays, long orderCount) {
        if (streakDays >= 60 && orderCount >= 10) return "만개";
        if (streakDays >= 30 && orderCount >= 5) return "꽃봉오리";
        if (streakDays >= 10 && orderCount >= 1) return "새싹";
        return "씨앗";
    }
}
