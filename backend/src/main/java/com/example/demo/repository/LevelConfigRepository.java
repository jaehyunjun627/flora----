package com.example.demo.repository;

import com.example.demo.entity.LevelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LevelConfigRepository extends JpaRepository<LevelConfig, Long> {

    Optional<LevelConfig> findByLevelNum(int levelNum);

    /** 주어진 포인트에 해당하는 레벨 조회 */
    @Query("SELECT l FROM LevelConfig l WHERE l.minPoints <= :points AND l.maxPoints >= :points")
    Optional<LevelConfig> findByPoints(@Param("points") int points);

    /** 다음 레벨 조회 */
    Optional<LevelConfig> findByLevelNum(Integer levelNum);
}
