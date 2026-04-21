package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.document.UserCalendar;
import com.flora.backend.service.UserCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * /api/user-calendar
 * 유저별 plants/events 영구 저장(Mongo user_calendar)을 위한 REST 엔드포인트.
 */
@RestController
@RequestMapping("/api/user-calendar")
@RequiredArgsConstructor
public class UserCalendarController {

    private final UserCalendarService userCalendarService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<?> get(@RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        return ResponseEntity.ok(userCalendarService.getCalendar(userId));
    }

    /** 전체 교체 저장 (프론트가 로컬 state 전체를 그대로 push) */
    @PutMapping
    public ResponseEntity<?> saveAll(@RequestBody Map<String, Object> body,
                                     @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        @SuppressWarnings("unchecked")
        List<UserCalendar.PlantEntry> plants = mapList(body.get("plants"), UserCalendar.PlantEntry.class);
        @SuppressWarnings("unchecked")
        List<UserCalendar.EventEntry> events = mapList(body.get("events"), UserCalendar.EventEntry.class);
        return ResponseEntity.ok(userCalendarService.saveCalendar(userId, plants, events));
    }

    @PostMapping("/plants")
    public ResponseEntity<?> addPlant(@RequestBody Map<String, Object> body,
                                      @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        UserCalendar.PlantEntry plant = toPlant(body.get("plant"));
        @SuppressWarnings("unchecked")
        List<UserCalendar.EventEntry> newEvents = mapList(body.get("events"), UserCalendar.EventEntry.class);
        return ResponseEntity.ok(userCalendarService.addPlantWithEvents(userId, plant, newEvents));
    }

    @DeleteMapping("/plants/{plantId}")
    public ResponseEntity<?> deletePlant(@PathVariable Long plantId,
                                         @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        return ResponseEntity.ok(userCalendarService.deletePlant(userId, plantId));
    }

    @PostMapping("/events")
    public ResponseEntity<?> addEvent(@RequestBody Map<String, Object> body,
                                      @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        UserCalendar.EventEntry event = toEvent(body);
        return ResponseEntity.ok(userCalendarService.addEvent(userId, event));
    }

    @PatchMapping("/events/{eventId}/toggle")
    public ResponseEntity<?> toggleEvent(@PathVariable Long eventId,
                                         @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        return ResponseEntity.ok(userCalendarService.toggleEvent(userId, eventId));
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId,
                                         @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "로그인이 필요합니다"));
        return ResponseEntity.ok(userCalendarService.deleteEvent(userId, eventId));
    }

    // ======== helpers ========

    private Long extractUserId(String token) {
        if (token == null || !token.startsWith("Bearer ")) return null;
        try { return jwtTokenProvider.getUserId(token.substring(7)); } catch (Exception e) { return null; }
    }

    @SuppressWarnings("unchecked")
    private <T> List<T> mapList(Object raw, Class<T> cls) {
        if (!(raw instanceof List<?> list)) return null;
        List<T> result = new java.util.ArrayList<>();
        for (Object item : list) {
            if (!(item instanceof Map)) continue;
            Map<String, Object> m = (Map<String, Object>) item;
            if (cls == UserCalendar.PlantEntry.class) {
                result.add((T) toPlant(m));
            } else if (cls == UserCalendar.EventEntry.class) {
                result.add((T) toEvent(m));
            }
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private UserCalendar.PlantEntry toPlant(Object raw) {
        if (!(raw instanceof Map<?, ?> m)) return null;
        return UserCalendar.PlantEntry.builder()
                .id(toLong(m.get("id")))
                .name(asString(m.get("name")))
                .nickname(asString(m.get("nickname")))
                .plantType(asString(m.get("plantType")))
                .build();
    }

    @SuppressWarnings("unchecked")
    private UserCalendar.EventEntry toEvent(Object raw) {
        if (!(raw instanceof Map<?, ?> m)) return null;
        return UserCalendar.EventEntry.builder()
                .id(toLong(m.get("id")))
                .plantId(toLong(m.get("plantId")))
                .plantName(asString(m.get("plantName")))
                .type(asString(m.get("type")))
                .title(asString(m.get("title")))
                .date(asString(m.get("date")))
                .isCompleted(asBool(m.get("isCompleted")))
                .isAiGenerated(asBool(m.get("isAiGenerated")))
                .memo(asString(m.get("memo")))
                .build();
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        try { return Long.valueOf(v.toString()); } catch (Exception e) { return null; }
    }

    private String asString(Object v) { return v == null ? null : v.toString(); }

    private Boolean asBool(Object v) {
        if (v == null) return false;
        if (v instanceof Boolean b) return b;
        return Boolean.parseBoolean(v.toString());
    }
}
