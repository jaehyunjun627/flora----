package com.flora.backend.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MongoDB: 유저의 "오늘의 퀴즈" 풀이 기록.
 * (userId, quizDate) 조합으로 unique → 하루 1회 풀이 보장.
 * 계정별/날짜별로 풀이 여부를 확인할 수 있어 로그아웃/다른 계정 로그인 시에도 정확히 동작.
 */
@Document(collection = "quiz_attempts")
@CompoundIndexes({
    @CompoundIndex(name = "uid_date_unique", def = "{'userId': 1, 'quizDate': 1}", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizAttempt {
    @Id
    private String id;

    @Indexed
    private Long userId;

    /** 퀴즈가 출제된 날짜 (yyyy-MM-dd) */
    private LocalDate quizDate;

    private Long quizId;
    private Integer selectedIdx;
    private Integer answerIdx;
    private Boolean isCorrect;

    private LocalDateTime answeredAt;
}
