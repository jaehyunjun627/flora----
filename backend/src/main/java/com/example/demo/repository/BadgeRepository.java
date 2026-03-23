package com.example.demo.repository;

import com.example.demo.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findAllByOrderBySortOrderAsc();

    List<Badge> findByBadgeCategoryOrderBySortOrderAsc(Badge.BadgeCategory category);
}
