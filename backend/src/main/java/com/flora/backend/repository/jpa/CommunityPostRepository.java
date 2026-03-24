package com.flora.backend.repository.jpa;

import com.flora.backend.entity.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    Page<CommunityPost> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<CommunityPost> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(String category, Pageable pageable);
}
