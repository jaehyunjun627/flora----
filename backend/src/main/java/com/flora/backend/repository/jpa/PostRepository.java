package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(String category, Pageable pageable);
    Page<Post> findByIsActiveTrueOrderByIsPinnedDescCreatedAtDesc(Pageable pageable);
    List<Post> findTop5ByCategoryAndIsActiveTrueOrderByIsPinnedDescCreatedAtDesc(String category);
}
