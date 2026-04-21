package com.flora.backend.service;

import com.flora.backend.document.QuizAttempt;
import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import com.flora.backend.repository.mongo.QuizAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 오늘의 퀴즈 서비스.
 * - 퀴즈 풀이 여부를 **MongoDB QuizAttempt** 에 (userId, quizDate) 유니크로 기록.
 *   이로써 로그아웃/다른 계정 로그인 시에도 localStorage에 의존하지 않고 정확한 상태 반환.
 * - 포인트 적립은 MyPageService.addPoints()를 통해 UserStats와 일관되게 관리.
 */
@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final MyPageService myPageService;

    public Map<String, Object> getDailyQuiz(Long userId) {
        Quiz quiz = quizRepository.findRandomQuiz();
        Map<String, Object> result = new HashMap<>();

        if (quiz == null) {
            result.put("id", 0L);
            result.put("question", "장미의 꽃말은 무엇일까요?");
            result.put("options", List.of("사랑", "우정", "희망", "감사"));
        } else {
            result.put("id", quiz.getId());
            result.put("question", quiz.getQuestion());
            List<String> options = new ArrayList<>(List.of(quiz.getOption1(), quiz.getOption2()));
            if (quiz.getOption3() != null) options.add(quiz.getOption3());
            if (quiz.getOption4() != null) options.add(quiz.getOption4());
            result.put("options", options);
            result.put("rewardPoints", quiz.getRewardPoints());
        }

        // 로그인 상태이면 오늘 풀이 여부 + 과거 결과를 조회
        LocalDate today = LocalDate.now();
        boolean alreadyAnswered = false;
        Map<String, Object> lastAttempt = null;
        if (userId != null) {
            Optional<QuizAttempt> attempt = quizAttemptRepository.findByUserIdAndQuizDate(userId, today);
            if (attempt.isPresent()) {
                alreadyAnswered = true;
                QuizAttempt a = attempt.get();
                lastAttempt = new HashMap<>();
                lastAttempt.put("selectedIdx", a.getSelectedIdx());
                lastAttempt.put("answerIdx", a.getAnswerIdx());
                lastAttempt.put("isCorrect", a.getIsCorrect());
                lastAttempt.put("answeredAt", a.getAnsweredAt());
            }
        }
        result.put("alreadyAnswered", alreadyAnswered);
        result.put("lastAttempt", lastAttempt);
        return result;
    }

    @Transactional
    public Map<String, Object> submitAnswer(Long userId, Long quizId, Integer selectedIdx) {
        if (userId == null) {
            throw new RuntimeException("로그인이 필요합니다");
        }

        LocalDate today = LocalDate.now();
        // 이미 오늘 풀었다면 재제출 거부 (멱등)
        if (quizAttemptRepository.existsByUserIdAndQuizDate(userId, today)) {
            QuizAttempt prev = quizAttemptRepository.findByUserIdAndQuizDate(userId, today).orElseThrow();
            Map<String, Object> response = new HashMap<>();
            response.put("alreadyAnswered", true);
            response.put("isCorrect", prev.getIsCorrect());
            response.put("answerIdx", prev.getAnswerIdx());
            response.put("selectedIdx", prev.getSelectedIdx());
            response.put("rewardPoints", 0);
            return response;
        }

        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("퀴즈를 찾을 수 없습니다"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        boolean isCorrect = quiz.getAnswerIdx().equals(selectedIdx);
        int reward = isCorrect ? quiz.getRewardPoints() : 0;

        // MongoDB에 풀이 기록
        QuizAttempt attempt = QuizAttempt.builder()
                .userId(userId)
                .quizDate(today)
                .quizId(quizId)
                .selectedIdx(selectedIdx)
                .answerIdx(quiz.getAnswerIdx())
                .isCorrect(isCorrect)
                .answeredAt(LocalDateTime.now())
                .build();
        quizAttemptRepository.save(attempt);

        // 포인트는 MyPageService로 통합
        if (isCorrect && reward > 0) {
            myPageService.addPoints(userId, reward);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("isCorrect", isCorrect);
        result.put("answerIdx", quiz.getAnswerIdx());
        result.put("explanation", quiz.getExplanation());
        result.put("rewardPoints", reward);
        result.put("alreadyAnswered", false);
        return result;
    }
}
