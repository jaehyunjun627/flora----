package com.flora.backend.service;

import com.flora.backend.document.UserCalendar;
import com.flora.backend.repository.mongo.UserCalendarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * UserCalendar(식물 + 일정) CRUD 서비스.
 * - 프론트의 plants/events 구조 그대로 upsert.
 * - 로그인 유저별 단일 도큐먼트(userId unique).
 */
@Service
@RequiredArgsConstructor
public class UserCalendarService {

    private final UserCalendarRepository userCalendarRepository;

    public UserCalendar getOrCreate(Long userId) {
        return userCalendarRepository.findByUserId(userId).orElseGet(() -> {
            UserCalendar created = UserCalendar.builder()
                    .userId(userId)
                    .plants(new ArrayList<>())
                    .events(new ArrayList<>())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return userCalendarRepository.save(created);
        });
    }

    public Map<String, Object> getCalendar(Long userId) {
        UserCalendar cal = getOrCreate(userId);
        Map<String, Object> map = new HashMap<>();
        map.put("plants", cal.getPlants());
        map.put("events", cal.getEvents());
        return map;
    }

    /** 전체 덮어쓰기 (프론트가 현재 상태 전체를 보낼 때) */
    public Map<String, Object> saveCalendar(Long userId, List<UserCalendar.PlantEntry> plants, List<UserCalendar.EventEntry> events) {
        UserCalendar cal = getOrCreate(userId);
        if (plants != null) cal.setPlants(plants);
        if (events != null) cal.setEvents(events);
        cal.setUpdatedAt(LocalDateTime.now());
        userCalendarRepository.save(cal);
        return getCalendar(userId);
    }

    /** 식물 1개 추가 */
    public Map<String, Object> addPlant(Long userId, UserCalendar.PlantEntry plant) {
        UserCalendar cal = getOrCreate(userId);
        if (plant.getAddedAt() == null) plant.setAddedAt(LocalDateTime.now());
        // 동일 id 존재 시 교체
        cal.getPlants().removeIf(p -> p.getId() != null && p.getId().equals(plant.getId()));
        cal.getPlants().add(plant);
        cal.setUpdatedAt(LocalDateTime.now());
        userCalendarRepository.save(cal);
        return getCalendar(userId);
    }

    /** 식물 + 생성된 일정들 한 번에 추가 */
    public Map<String, Object> addPlantWithEvents(Long userId, UserCalendar.PlantEntry plant, List<UserCalendar.EventEntry> newEvents) {
        UserCalendar cal = getOrCreate(userId);
        if (plant != null) {
            if (plant.getAddedAt() == null) plant.setAddedAt(LocalDateTime.now());
            cal.getPlants().removeIf(p -> p.getId() != null && p.getId().equals(plant.getId()));
            cal.getPlants().add(plant);
        }
        if (newEvents != null && !newEvents.isEmpty()) {
            cal.getEvents().addAll(newEvents);
        }
        cal.setUpdatedAt(LocalDateTime.now());
        userCalendarRepository.save(cal);
        return getCalendar(userId);
    }

    /** 식물 삭제 (관련 일정도 같이 삭제) */
    public Map<String, Object> deletePlant(Long userId, Long plantId) {
        UserCalendar cal = getOrCreate(userId);
        cal.getPlants().removeIf(p -> p.getId() != null && p.getId().equals(plantId));
        cal.getEvents().removeIf(e -> e.getPlantId() != null && e.getPlantId().equals(plantId));
        cal.setUpdatedAt(LocalDateTime.now());
        userCalendarRepository.save(cal);
        return getCalendar(userId);
    }

    /** 일정 추가 */
    public Map<String, Object> addEvent(Long userId, UserCalendar.EventEntry event) {
        UserCalendar cal = getOrCreate(userId);
        cal.getEvents().removeIf(e -> e.getId() != null && e.getId().equals(event.getId()));
        cal.getEvents().add(event);
        cal.setUpdatedAt(LocalDateTime.now());
        userCalendarRepository.save(cal);
        return getCalendar(userId);
    }

    /** 일정 완료 토글 */
    public Map<String, Object> toggleEvent(Long userId, Long eventId) {
        UserCalendar cal = getOrCreate(userId);
        cal.getEvents().forEach(e -> {
            if (e.getId() != null && e.getId().equals(eventId)) {
                e.setIsCompleted(Boolean.TRUE.equals(e.getIsCompleted()) ? false : true);
            }
        });
        cal.setUpdatedAt(LocalDateTime.now());
        userCalendarRepository.save(cal);
        return getCalendar(userId);
    }

    /** 일정 삭제 */
    public Map<String, Object> deleteEvent(Long userId, Long eventId) {
        UserCalendar cal = getOrCreate(userId);
        cal.getEvents().removeIf(e -> e.getId() != null && e.getId().equals(eventId));
        cal.setUpdatedAt(LocalDateTime.now());
        userCalendarRepository.save(cal);
        return getCalendar(userId);
    }
}
