package com.example.demo.repository;

import com.example.demo.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByUserUserIdAndAttendanceDate(Long userId, LocalDate date);

    boolean existsByUserUserIdAndAttendanceDate(Long userId, LocalDate date);

    /** 이번 달 출석 목록 */
    @Query("SELECT a FROM Attendance a WHERE a.user.userId = :userId " +
           "AND YEAR(a.attendanceDate) = :year AND MONTH(a.attendanceDate) = :month " +
           "ORDER BY a.attendanceDate ASC")
    List<Attendance> findByUserAndMonth(@Param("userId") Long userId,
                                        @Param("year") int year,
                                        @Param("month") int month);

    /** 총 출석 일수 */
    long countByUserUserId(Long userId);

    /** 연속 출석 계산용: 최근 출석일 목록 */
    @Query("SELECT a FROM Attendance a WHERE a.user.userId = :userId " +
           "AND a.attendanceDate <= :today ORDER BY a.attendanceDate DESC")
    List<Attendance> findRecentAttendances(@Param("userId") Long userId,
                                           @Param("today") LocalDate today);
}
