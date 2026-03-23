package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "USER_TERM_CONSENTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserTermConsent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id", nullable = false)
    private Term term;

    private Boolean consented;

    @Column(name = "consented_at")
    private LocalDateTime consentedAt;
}
