package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_mission_log")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMissionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id")
    private Mission mission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "special_mission_id")
    private SpecialMission specialMission;

    @Column(name = "completed_date", nullable = false)
    @Builder.Default
    private LocalDate completedDate = LocalDate.now();

    @Column(name = "points_earned")
    @Builder.Default
    private Integer pointsEarned = 0;
}
