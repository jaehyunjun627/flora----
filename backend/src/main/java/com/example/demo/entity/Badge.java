package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badges")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "badge_id")
    private Long badgeId;

    @Column(name = "badge_name", nullable = false, length = 100)
    private String badgeName;

    @Column(name = "badge_icon", length = 500)
    private String badgeIcon;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "badge_category", length = 50)
    private BadgeCategory badgeCategory;

    @Column(name = "required_condition", length = 500)
    private String requiredCondition;

    @Column(name = "required_value")
    @Builder.Default
    private Integer requiredValue = 1;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    public enum BadgeCategory {
        ATTENDANCE, MISSION, PLANT, LEVEL, SPECIAL
    }
}
