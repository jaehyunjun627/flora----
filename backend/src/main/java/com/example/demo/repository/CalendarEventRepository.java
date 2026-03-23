package com.example.demo.repository;

import com.example.demo.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    /** 특정 월의 이벤트 조회 */
    @Query("SELECT e FROM CalendarEvent e WHERE e.user.userId = :userId " +
           "AND YEAR(e.eventDate) = :year AND MONTH(e.eventDate) = :month " +
           "ORDER BY e.eventDate ASC")
    List<CalendarEvent> findByUserAndMonth(@Param("userId") Long userId,
                                           @Param("year") int year,
                                           @Param("month") int month);

    /** 오늘 + 앞으로 7일 이내 일정 */
    @Query("SELECT e FROM CalendarEvent e WHERE e.user.userId = :userId " +
           "AND e.eventDate BETWEEN :from AND :to AND e.isCompleted = false " +
           "ORDER BY e.eventDate ASC")
    List<CalendarEvent> findUpcoming(@Param("userId") Long userId,
                                     @Param("from") LocalDate from,
                                     @Param("to") LocalDate to);

    /** 오늘 일정 */
    List<CalendarEvent> findByUserUserIdAndEventDateOrderByEventTitleAsc(Long userId, LocalDate eventDate);

    /** 특정 식물의 이벤트 조회 */
    List<CalendarEvent> findByPlantPlantIdOrderByEventDateAsc(Long plantId);
}
