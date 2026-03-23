package com.flora.backend.repository.jpa;

import com.flora.backend.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    Page<Notice> findAllByOrderByIsPinnedDescCreatedAtDesc(Pageable pageable);
    List<Notice> findTop5ByOrderByIsPinnedDescCreatedAtDesc();
}
