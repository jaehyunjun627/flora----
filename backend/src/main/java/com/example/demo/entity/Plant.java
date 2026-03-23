package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plants")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plant_id")
    private Long plantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "plant_name", nullable = false, length = 100)
    private String plantName;

    @Column(name = "nickname", length = 100)
    private String nickname;

    @Column(name = "plant_type", length = 50)
    private String plantType;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private PlantStatus status = PlantStatus.HEALTHY;

    @Column(name = "watering_interval")
    @Builder.Default
    private Integer wateringInterval = 7;   // 일

    @Column(name = "repotting_interval")
    @Builder.Default
    private Integer repottingInterval = 180; // 일

    @Column(name = "last_watered_date")
    private LocalDate lastWateredDate;

    @Column(name = "last_repotted_date")
    private LocalDate lastRepottedDate;

    @Column(name = "added_date", nullable = false)
    @Builder.Default
    private LocalDate addedDate = LocalDate.now();

    @OneToMany(mappedBy = "plant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CalendarEvent> calendarEvents = new ArrayList<>();

    public enum PlantStatus {
        HEALTHY, NEEDS_WATER, NEEDS_REPOTTING, SICK, DORMANT
    }
}
