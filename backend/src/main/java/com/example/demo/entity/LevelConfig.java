package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "level_config")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LevelConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "level_id")
    private Long levelId;

    @Column(name = "level_num", nullable = false, unique = true)
    private Integer levelNum;

    @Column(name = "level_name", nullable = false, length = 50)
    private String levelName;

    @Column(name = "min_points", nullable = false)
    private Integer minPoints;

    @Column(name = "max_points", nullable = false)
    private Integer maxPoints;

    @Column(name = "benefit_description", length = 500)
    private String benefitDescription;

    @Column(name = "discount_rate", precision = 5, scale = 2)
    @Builder.Default
    private Double discountRate = 0.0;
}
