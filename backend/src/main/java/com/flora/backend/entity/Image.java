package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "IMAGES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;  // PRODUCT, POST, DIARY 등

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
