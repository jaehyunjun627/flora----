package com.example.demo.repository;

import com.example.demo.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUserUserIdOrderByEarnedDateDesc(Long userId);

    Optional<UserBadge> findByUserUserIdAndBadgeBadgeId(Long userId, Long badgeId);

    boolean existsByUserUserIdAndBadgeBadgeId(Long userId, Long badgeId);

    /** 현재 명함에 선택된 대표 뱃지 */
    Optional<UserBadge> findByUserUserIdAndIsSelectedTrue(Long userId);

    /** 획득한 뱃지 ID 목록 */
    @Query("SELECT ub.badge.badgeId FROM UserBadge ub WHERE ub.user.userId = :userId")
    List<Long> findEarnedBadgeIdsByUserId(@Param("userId") Long userId);
}
