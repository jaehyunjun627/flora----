package com.shop.backend.service;

import com.shop.backend.domain.Member;
import com.shop.backend.domain.QuizAttempt;
import com.shop.backend.repository.MemberRepository;
import com.shop.backend.repository.QuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class QuizService {

    private static final int POINTS_PER_CORRECT = 15;

    // 퀴즈 정답 인덱스 목록 (프론트엔드 quizData.js와 동일한 순서)
    private static final List<Integer> CORRECT_ANSWERS = List.of(
        0, // 장미 꽃말
        0, // 봄에 피지 않는 꽃
        0, // 해바라기 꽃말
        2, // 튤립 원산지
        1, // 무궁화 개화 시기
        0, // 국화 꽃말
        3, // 벚꽃 학명
        1, // 수선화 꽃말
        2, // 라벤더 효능
        0, // 민들레 꽃말
        1, // 백합 꽃말
        3, // 카네이션 기념일
        0, // 아이리스 상징
        2, // 봄의 여왕
        1, // 목련 개화
        0, // 코스모스 꽃말
        3, // 복숭아꽃 꽃말
        2, // 동백꽃 특징
        1, // 매화 개화
        0  // 진달래 특징
    );

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private MemberRepository memberRepository;

    public int getTodayQuizIndex() {
        LocalDate today = LocalDate.now();
        int dayOfYear = today.getDayOfYear();
        return dayOfYear % CORRECT_ANSWERS.size();
    }

    public Map<String, Object> submitAnswer(Long memberId, int answerIndex) {
        Map<String, Object> result = new HashMap<>();
        LocalDate today = LocalDate.now();

        // 오늘 이미 응답했는지 확인
        Optional<QuizAttempt> existing = quizAttemptRepository.findByMemberIdAndQuizDate(memberId, today);
        if (existing.isPresent()) {
            result.put("alreadyAnswered", true);
            result.put("correct", existing.get().isCorrect());
            result.put("pointsEarned", 0);
            return result;
        }

        // 정답 확인
        int quizIndex = getTodayQuizIndex();
        boolean correct = (answerIndex == CORRECT_ANSWERS.get(quizIndex));

        // 시도 기록 저장
        QuizAttempt attempt = new QuizAttempt();
        attempt.setMemberId(memberId);
        attempt.setQuizDate(today);
        attempt.setCorrect(correct);
        quizAttemptRepository.save(attempt);

        // 정답이면 포인트 지급
        int pointsEarned = 0;
        if (correct) {
            Optional<Member> memberOpt = memberRepository.findById(memberId);
            if (memberOpt.isPresent()) {
                Member member = memberOpt.get();
                member.setPoints(member.getPoints() + POINTS_PER_CORRECT);
                memberRepository.save(member);
                pointsEarned = POINTS_PER_CORRECT;
            }
        }

        result.put("alreadyAnswered", false);
        result.put("correct", correct);
        result.put("pointsEarned", pointsEarned);
        return result;
    }
}
