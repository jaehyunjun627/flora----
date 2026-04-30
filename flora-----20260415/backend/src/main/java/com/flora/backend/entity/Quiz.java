package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "QUIZZES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String question;

    @Column(name = "option_1", nullable = false)
    private String option1;

    @Column(name = "option_2", nullable = false)
    private String option2;

    @Column(name = "option_3")
    private String option3;

    @Column(name = "option_4")
    private String option4;

    @Column(name = "answer_idx", nullable = false)
    private Integer answerIdx;

    @Column(columnDefinition = "CLOB")
    private String explanation;

    @Column(name = "reward_points")
    @Builder.Default
    private Integer rewardPoints = 10;
}
