package com.shop.backend.controller;

import com.shop.backend.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @Autowired
    private QuizService quizService;

    // 오늘의 퀴즈 인덱스 조회
    @GetMapping("/daily-index")
    public ResponseEntity<Map<String, Integer>> getTodayQuizIndex() {
        int index = quizService.getTodayQuizIndex();
        return ResponseEntity.ok(Map.of("quizIndex", index));
    }

    // 퀴즈 답 제출
    @PostMapping("/submit")
    public ResponseEntity<?> submitAnswer(@RequestBody SubmitRequest request) {
        try {
            Map<String, Object> result = quizService.submitAnswer(
                request.getMemberId(),
                request.getAnswerIndex()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    public static class SubmitRequest {
        private Long memberId;
        private int answerIndex;

        public Long getMemberId() { return memberId; }
        public void setMemberId(Long memberId) { this.memberId = memberId; }
        public int getAnswerIndex() { return answerIndex; }
        public void setAnswerIndex(int answerIndex) { this.answerIndex = answerIndex; }
    }
}
