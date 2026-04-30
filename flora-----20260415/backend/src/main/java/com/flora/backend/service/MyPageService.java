package com.flora.backend.service;

import com.flora.backend.document.UserStats;
import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import com.flora.backend.repository.mongo.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 마이페이지 서비스.
 * - 기본 계정/프로필 정보는 Oracle(User)에서 조회
 * - 출석/포인트/뱃지/게이지는 **MongoDB(UserStats)** 를 Source of Truth로 사용
 *   Oracle User 엔티티의 points/streakDays 필드는 하위호환을 위해 함께 sync.
 */
@Service
@RequiredArgsConstructor
public class MyPageService {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final UserStatsRepository userStatsRepository;

    // 포인트 구간별 레벨 (UI의 PointLevel과 동일)
    private static final int[] LEVEL_THRESHOLDS = {0, 100, 300, 600, 1000};

    public Map<String, Object> getMyPage(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        UserStats stats = getOrCreateStats(user);

        long orderCount = orderRepository.countByUserId(userId);
        String grade = getGrade(stats.getStreakDays(), orderCount);

        List<Map<String, Object>> badgeList = new ArrayList<>();
        if (stats.getBadges() != null) {
            for (UserStats.BadgeRecord b : stats.getBadges()) {
                Map<String, Object> bMap = new HashMap<>();
                bMap.put("badgeCode", b.getCode());
                bMap.put("badgeName", b.getName());
                bMap.put("earnedAt", b.getEarnedAt());
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
        result.put("points", stats.getPoints());
        result.put("streakDays", stats.getStreakDays());
        result.put("gauge", stats.getGauge());
        result.put("lastCheckIn", stats.getLastCheckIn());
        result.put("attendanceDates", stats.getAttendanceDates());
        result.put("grade", grade);
        result.put("orderCount", orderCount);
        result.put("badges", badgeList);
        result.put("createdAt", user.getCreatedAt());
        return result;
    }

    @Transactional
    public Map<String, Object> checkIn(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        UserStats stats = getOrCreateStats(user);

        LocalDate today = LocalDate.now();
        if (today.equals(stats.getLastCheckIn())) {
            return Map.of(
                "message", "오늘 이미 출석했습니다",
                "alreadyCheckedIn", true,
                "streakDays", stats.getStreakDays(),
                "points", stats.getPoints(),
                "gauge", stats.getGauge()
            );
        }

        if (stats.getLastCheckIn() != null && stats.getLastCheckIn().plusDays(1).equals(today)) {
            stats.setStreakDays(stats.getStreakDays() + 1);
        } else {
            stats.setStreakDays(1);
        }
        stats.setLastCheckIn(today);
        stats.setPoints(stats.getPoints() + 5);

        if (stats.getAttendanceDates() == null) stats.setAttendanceDates(new ArrayList<>());
        String todayStr = today.toString();
        if (!stats.getAttendanceDates().contains(todayStr)) {
            stats.getAttendanceDates().add(todayStr);
        }

        checkAndAwardBadge(user, stats);
        recalcGauge(stats);
        stats.setUpdatedAt(LocalDateTime.now());
        userStatsRepository.save(stats);

        // Oracle User 하위호환 sync
        user.setStreakDays(stats.getStreakDays());
        user.setPoints(stats.getPoints());
        user.setLastCheckIn(today);
        user.setBadges(badgesToCsv(stats));
        userRepository.save(user);

        return Map.of(
            "message", "출석 완료! +5 포인트",
            "alreadyCheckedIn", false,
            "streakDays", stats.getStreakDays(),
            "points", stats.getPoints(),
            "gauge", stats.getGauge()
        );
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

    /**
     * UserStats를 조회하거나 없으면 Oracle User의 기존 값으로 마이그레이션 생성.
     */
    public UserStats getOrCreateStats(User user) {
        return userStatsRepository.findByUserId(user.getId()).orElseGet(() -> {
            List<UserStats.BadgeRecord> initial = new ArrayList<>();
            if (user.getBadges() != null && !user.getBadges().isBlank()) {
                for (String code : user.getBadges().split(",")) {
                    String c = code.trim();
                    if (c.isEmpty()) continue;
                    initial.add(UserStats.BadgeRecord.builder()
                            .code(c).name(badgeName(c))
                            .earnedAt(LocalDateTime.now()).build());
                }
            }
            UserStats created = UserStats.builder()
                    .userId(user.getId())
                    .points(user.getPoints() == null ? 0 : user.getPoints())
                    .streakDays(user.getStreakDays() == null ? 0 : user.getStreakDays())
                    .lastCheckIn(user.getLastCheckIn())
                    .attendanceDates(new ArrayList<>())
                    .badges(initial)
                    .gauge(0)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            recalcGauge(created);
            return userStatsRepository.save(created);
        });
    }

    /** QuizService 등 외부에서 포인트 적립용 */
    @Transactional
    public void addPoints(Long userId, int delta) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        UserStats stats = getOrCreateStats(user);
        stats.setPoints(Math.max(0, stats.getPoints() + delta));
        recalcGauge(stats);
        stats.setUpdatedAt(LocalDateTime.now());
        userStatsRepository.save(stats);

        user.setPoints(stats.getPoints());
        userRepository.save(user);
    }

    private void checkAndAwardBadge(User user, UserStats stats) {
        long orderCount = orderRepository.countByUserId(user.getId());
        awardIfEligible(stats, "SPROUT", stats.getStreakDays() >= 10 && orderCount >= 1);
        awardIfEligible(stats, "BUD",    stats.getStreakDays() >= 30 && orderCount >= 5);
        awardIfEligible(stats, "BLOOM",  stats.getStreakDays() >= 60 && orderCount >= 10);
        // 포인트 기반 뱃지도 추가
        awardIfEligible(stats, "LEAF",   stats.getPoints() >= 300);
        awardIfEligible(stats, "MASTER", stats.getPoints() >= 1000);
    }

    private void awardIfEligible(UserStats stats, String code, boolean eligible) {
        if (!eligible) return;
        boolean already = stats.getBadges().stream().anyMatch(b -> code.equals(b.getCode()));
        if (already) return;
        stats.getBadges().add(UserStats.BadgeRecord.builder()
                .code(code).name(badgeName(code)).earnedAt(LocalDateTime.now()).build());
    }

    private void recalcGauge(UserStats stats) {
        int points = stats.getPoints() == null ? 0 : stats.getPoints();
        int lower = 0, upper = 100;
        for (int i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
            if (points >= LEVEL_THRESHOLDS[i] && points < LEVEL_THRESHOLDS[i + 1]) {
                lower = LEVEL_THRESHOLDS[i];
                upper = LEVEL_THRESHOLDS[i + 1];
                break;
            }
            if (i == LEVEL_THRESHOLDS.length - 2 && points >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
                lower = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
                upper = lower;
            }
        }
        int gauge = (upper == lower) ? 100 : (int) Math.round(100.0 * (points - lower) / (upper - lower));
        stats.setGauge(Math.max(0, Math.min(100, gauge)));
    }

    private String badgesToCsv(UserStats stats) {
        if (stats.getBadges() == null || stats.getBadges().isEmpty()) return "";
        StringJoiner sj = new StringJoiner(",");
        for (UserStats.BadgeRecord b : stats.getBadges()) sj.add(b.getCode());
        return sj.toString();
    }

    private String badgeName(String code) {
        return switch (code) {
            case "SPROUT" -> "새싹";
            case "BUD"    -> "꽃봉오리";
            case "BLOOM"  -> "만개";
            case "LEAF"   -> "잎사귀";
            case "MASTER" -> "그린 마스터";
            default        -> code;
        };
    }

    private String getGrade(int streakDays, long orderCount) {
        if (streakDays >= 60 && orderCount >= 10) return "만개";
        if (streakDays >= 30 && orderCount >= 5)  return "꽃봉오리";
        if (streakDays >= 10 && orderCount >= 1)  return "새싹";
        return "씨앗";
    }
}
