package com.flora.backend.controller;

import com.flora.backend.config.JwtTokenProvider;
import com.flora.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/daily")
    public ResponseEntity<?> getDailyQuiz(@RequestHeader(value = "Authorization", required = false) String token) {
        Long userId = extractUserId(token);
        return ResponseEntity.ok(quizService.getDailyQuiz(userId));
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitAnswer(@RequestBody Map<String, Object> body,
                                          @RequestHeader("Authorization") String token) {
        Long userId = extractUserId(token);
        Long quizId = Long.valueOf(body.get("quizId").toString());
        Integer selectedIdx = Integer.valueOf(body.get("selectedIdx").toString());
        return ResponseEntity.ok(quizService.submitAnswer(userId, quizId, selectedIdx));
    }

    private Long extractUserId(String token) {
        if (token == null || !token.startsWith("Bearer ")) return null;
        try { return jwtTokenProvider.getUserId(token.substring(7)); } catch (Exception e) { return null; }
    }
}
