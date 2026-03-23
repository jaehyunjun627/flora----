package com.example.demo.repository;

import com.example.demo.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, Long> {

    /** 활성화된 기본 미션 조회 (정렬 포함) */
    List<Mission> findByMissionTypeAndIsActiveTrueOrderBySortOrderAsc(Mission.MissionType missionType);
}
