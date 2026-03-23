package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "plant_card")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "selected_badge_id")
    private Badge selectedBadge;

    @Column(name = "card_color", length = 20)
    @Builder.Default
    private String cardColor = "#4CAF50";

    /** 링크 공유용 고유 토큰 */
    @Column(name = "share_link_token", unique = true, length = 100)
    private String shareLinkToken;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
