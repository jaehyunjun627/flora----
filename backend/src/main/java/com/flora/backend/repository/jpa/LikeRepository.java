package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByTargetTypeAndTargetIdAndUserId(String targetType, Long targetId, Long userId);
    long countByTargetTypeAndTargetId(String targetType, Long targetId);
}
