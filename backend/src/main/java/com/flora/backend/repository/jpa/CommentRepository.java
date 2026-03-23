package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTargetTypeAndTargetIdAndIsActiveTrueOrderByCreatedAtAsc(String targetType, Long targetId);
}
