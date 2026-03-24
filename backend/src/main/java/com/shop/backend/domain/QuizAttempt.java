package com.shop.backend.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "QUIZ_ATTEMPT")
@Data
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long memberId;

    @Column(name = "QUIZ_DATE", nullable = false)
    private LocalDate quizDate;

    @Column(nullable = false)
    private boolean correct;
}
