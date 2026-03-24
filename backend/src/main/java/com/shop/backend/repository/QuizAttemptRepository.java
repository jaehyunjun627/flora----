package com.shop.backend.repository;

import com.shop.backend.domain.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    Optional<QuizAttempt> findByMemberIdAndQuizDate(Long memberId, LocalDate quizDate);
}
