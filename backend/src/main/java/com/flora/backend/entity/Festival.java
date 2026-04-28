package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "FESTIVALS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Festival {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 10)
    private String emoji;

    @Column(length = 50)
    private String region;

    @Column(length = 100)
    private String location;

    @Column(length = 30)
    private String category;

    @Column(length = 50)
    private String organizer;

    private Double lat;
    private Double lng;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "CLOB")
    private String description;

    @Column(name = "bg_color", length = 20)
    private String bgColor;

    @Column(length = 200)
    private String tags;
}
