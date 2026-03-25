package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.service.PlantCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class PlantCalendarController {
    private final PlantCalendarService calendarService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<?> getCalendars(@RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(calendarService.getCalendars(userId));
    }

    @PostMapping
    public ResponseEntity<?> createCalendar(@RequestBody Map<String, Object> body,
                                            @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        Integer cycle = body.get("wateringCycleDays") != null ? Integer.valueOf(body.get("wateringCycleDays").toString()) : 7;
        return ResponseEntity.ok(calendarService.createCalendar(userId,
            (String) body.get("plantNickname"), cycle,
            (String) body.get("repotDate"), (String) body.get("fertilizeDate")));
    }

    @PostMapping("/{id}/watering")
    public ResponseEntity<?> wateringDone(@PathVariable Long id,
                                          @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(calendarService.wateringDone(id, userId));
    }

    @GetMapping("/{id}/diaries")
    public ResponseEntity<?> getDiaries(@PathVariable Long id,
                                        @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(calendarService.getDiaries(id));
    }

    @PostMapping("/{id}/diaries")
    public ResponseEntity<?> createDiary(@PathVariable Long id,
                                         @RequestBody Map<String, String> body,
                                         @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(calendarService.createDiary(id, body.get("memo"), body.get("imageUrl")));
    }

    private Long extractUserId(String token) {
        if (token == null || !token.startsWith("Bearer ")) return null;
        try { return jwtTokenProvider.getUserId(token.substring(7)); } catch (Exception e) { return null; }
    }
}
