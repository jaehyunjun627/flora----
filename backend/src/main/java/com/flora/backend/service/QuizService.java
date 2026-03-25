package com.flora.backend.service;

import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getDailyQuiz(Long userId) {
        Quiz quiz = quizRepository.findRandomQuiz();
        if (quiz == null) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("id", 0L);
            fallback.put("question", "장미의 꽃말은 무엇일까요?");
            fallback.put("options", List.of("사랑", "우정", "희망", "감사"));
            fallback.put("alreadyAnswered", false);
            return fallback;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", quiz.getId());
        result.put("question", quiz.getQuestion());
        List<String> options = new ArrayList<>(List.of(quiz.getOption1(), quiz.getOption2()));
        if (quiz.getOption3() != null) options.add(quiz.getOption3());
        if (quiz.getOption4() != null) options.add(quiz.getOption4());
        result.put("options", options);
        result.put("rewardPoints", quiz.getRewardPoints());
        result.put("alreadyAnswered", false);
        return result;
    }

    @Transactional
    public Map<String, Object> submitAnswer(Long userId, Long quizId, Integer selectedIdx) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("퀴즈를 찾을 수 없습니다"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        boolean isCorrect = quiz.getAnswerIdx().equals(selectedIdx);

        if (isCorrect) {
            user.setPoints(user.getPoints() + quiz.getRewardPoints());
            userRepository.save(user);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("isCorrect", isCorrect);
        result.put("answerIdx", quiz.getAnswerIdx());
        result.put("explanation", quiz.getExplanation());
        result.put("rewardPoints", isCorrect ? quiz.getRewardPoints() : 0);
        return result;
    }
}
