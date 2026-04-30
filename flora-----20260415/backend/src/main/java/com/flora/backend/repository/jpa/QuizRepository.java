package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    @Query(value = "SELECT * FROM QUIZZES ORDER BY DBMS_RANDOM.VALUE FETCH FIRST 1 ROWS ONLY", nativeQuery = true)
    Quiz findRandomQuiz();
}
