package com.flora.backend.repository.jpa;

import com.flora.backend.entity.PlantCalendar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlantCalendarRepository extends JpaRepository<PlantCalendar, Long> {
    List<PlantCalendar> findByUserIdOrderByCreatedAtDesc(Long userId);
}
