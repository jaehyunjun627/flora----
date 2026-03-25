package com.flora.backend.service;

import com.flora.backend.entity.*;
import com.flora.backend.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PlantCalendarService {
    private final PlantCalendarRepository calendarRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getCalendars(Long userId) {
        return calendarRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("plantNickname", c.getPlantNickname());
                map.put("wateringCycleDays", c.getWateringCycleDays());
                map.put("wateringNextDate", c.getWateringNextDate());
                map.put("wateringIsDone", c.getWateringIsDone());
                map.put("repotDate", c.getRepotDate());
                map.put("fertilizeDate", c.getFertilizeDate());
                map.put("diaryMemo", c.getDiaryMemo());
                map.put("diaryImageUrl", c.getDiaryImageUrl());
                map.put("diaryRecordedDate", c.getDiaryRecordedDate());
                return map;
            }).toList();
    }

    @Transactional
    public Map<String, Object> createCalendar(Long userId, String plantNickname, Integer wateringCycleDays, String repotDate, String fertilizeDate) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        PlantCalendar calendar = PlantCalendar.builder()
            .user(user)
            .plantNickname(plantNickname)
            .wateringCycleDays(wateringCycleDays)
            .wateringNextDate(LocalDate.now().plusDays(wateringCycleDays != null ? wateringCycleDays : 7))
            .repotDate(repotDate != null ? LocalDate.parse(repotDate) : null)
            .fertilizeDate(fertilizeDate != null ? LocalDate.parse(fertilizeDate) : null)
            .build();
        calendarRepository.save(calendar);
        return Map.of("id", calendar.getId(), "message", "식물이 등록되었습니다");
    }

    @Transactional
    public Map<String, Object> wateringDone(Long calendarId, Long userId) {
        PlantCalendar calendar = calendarRepository.findById(calendarId)
            .orElseThrow(() -> new RuntimeException("캘린더를 찾을 수 없습니다"));
        calendar.setWateringIsDone(true);
        calendar.setWateringNextDate(LocalDate.now().plusDays(calendar.getWateringCycleDays() != null ? calendar.getWateringCycleDays() : 7));
        calendarRepository.save(calendar);
        return Map.of("message", "물주기 완료!", "nextWateringDate", calendar.getWateringNextDate());
    }

    // GrowthDiary 통합 - 일지를 PlantCalendar에 직접 저장
    @Transactional
    public Map<String, Object> createDiary(Long calendarId, String memo, String imageUrl) {
        PlantCalendar calendar = calendarRepository.findById(calendarId)
            .orElseThrow(() -> new RuntimeException("캘린더를 찾을 수 없습니다"));
        calendar.setDiaryMemo(memo);
        calendar.setDiaryImageUrl(imageUrl);
        calendar.setDiaryRecordedDate(LocalDate.now());
        calendarRepository.save(calendar);
        return Map.of("id", calendar.getId(), "message", "일기가 저장되었습니다");
    }
}
