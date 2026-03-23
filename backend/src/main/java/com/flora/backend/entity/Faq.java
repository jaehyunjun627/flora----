package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "FAQS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String question;

    @Column(columnDefinition = "CLOB")
    private String answer;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
