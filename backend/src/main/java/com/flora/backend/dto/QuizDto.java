package com.flora.backend.dto;

import com.flora.backend.entity.Quiz;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizDto {
    private Long id;
    private String question;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private Integer answerIdx;
    private String explanation;
    private Integer rewardPoints;

    // 답변 제출용
    private Integer selectedIdx;
    private Boolean isCorrect;

    public static QuizDto from(Quiz q) {
        return QuizDto.builder()
                .id(q.getId())
                .question(q.getQuestion())
                .option1(q.getOption1())
                .option2(q.getOption2())
                .option3(q.getOption3())
                .option4(q.getOption4())
                .answerIdx(q.getAnswerIdx())
                .explanation(q.getExplanation())
                .rewardPoints(q.getRewardPoints())
                .build();
    }
}
