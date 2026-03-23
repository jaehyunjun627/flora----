package com.example.demo.repository;

import com.example.demo.entity.UserMissionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface UserMissionLogRepository extends JpaRepository<UserMissionLog, Long> {

    /** 오늘 완료한 미션 목록 */
    List<UserMissionLog> findByUserUserIdAndCompletedDate(Long userId, LocalDate date);

    /** 오늘 특정 기본미션 완료 여부 */
    boolean existsByUserUserIdAndMissionMissionIdAndCompletedDate(Long userId, Long missionId, LocalDate date);

    /** 오늘 특별미션 완료 여부 */
    boolean existsByUserUserIdAndSpecialMissionSpecialMissionIdAndCompletedDate(
            Long userId, Long specialMissionId, LocalDate date);

    /** 전체 완료 횟수 */
    long countByUserUserId(Long userId);

    /** 오늘 총 획득 포인트 */
    @Query("SELECT COALESCE(SUM(l.pointsEarned), 0) FROM UserMissionLog l " +
           "WHERE l.user.userId = :userId AND l.completedDate = :date")
    Integer sumPointsEarnedByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
}
