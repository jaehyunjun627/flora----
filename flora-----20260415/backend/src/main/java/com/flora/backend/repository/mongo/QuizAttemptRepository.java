package com.flora.backend.repository.mongo;

import com.flora.backend.document.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    Optional<QuizAttempt> findByUserIdAndQuizDate(Long userId, LocalDate quizDate);
    boolean existsByUserIdAndQuizDate(Long userId, LocalDate quizDate);
}
