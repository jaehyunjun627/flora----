package com.flora.backend.repository.jpa;

import com.flora.backend.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {
    boolean existsByUserIdAndQuizIdAndAnsweredDate(Long userId, Long quizId, LocalDate answeredDate);
}
