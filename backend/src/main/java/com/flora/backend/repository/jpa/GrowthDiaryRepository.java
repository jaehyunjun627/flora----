package com.flora.backend.repository.jpa;

import com.flora.backend.entity.GrowthDiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrowthDiaryRepository extends JpaRepository<GrowthDiary, Long> {
    List<GrowthDiary> findByCalendarIdOrderByRecordedDateDesc(Long calendarId);
}
