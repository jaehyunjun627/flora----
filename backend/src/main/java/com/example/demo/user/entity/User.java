package com.example.demo.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "USERS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", length = 200)
    private String passwordHash;

    @Column(length = 30)
    private String nickname;

    @Column(length = 20)
    private String phone;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "profile_emoji", length = 10)
    private String profileEmoji;

    @Column(length = 20)
    @Builder.Default
    private String role = "USER";

    @Column(name = "is_active")
    @Builder.Default
    private Integer isActive = 1;

    @Builder.Default
    private Integer points = 0;

    @Column(name = "streak_days")
    @Builder.Default
    private Integer streakDays = 0;

    @Column(name = "last_check_in")
    private LocalDate lastCheckIn;

    @Column(name = "farm_name", length = 50)
    private String farmName;

    @Column(name = "seller_status", length = 20)
    private String sellerStatus;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
