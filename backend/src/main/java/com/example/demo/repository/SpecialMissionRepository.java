package com.example.demo.repository;

import com.example.demo.entity.SpecialMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SpecialMissionRepository extends JpaRepository<SpecialMission, Long> {

    /** 전체 특별 미션 수 */
    @Query("SELECT COUNT(s) FROM SpecialMission s")
    long countAll();

    /**
     * 날짜 기반 순환 인덱스로 오늘의 특별 미션 조회
     * dayIndex = MOD(dayOfYear, totalCount)
     */
    Optional<SpecialMission> findByDayIndex(int dayIndex);
}
