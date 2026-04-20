package com.flora.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATIONS")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 알림 받을 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 알림 타입: LIKE, COMMENT, ORDER_STATUS, NEW_ORDER
    @Column(length = 20, nullable = false)
    private String type;

    // 알림 메시지
    @Column(nullable = false)
    private String message;

    // 관련 ID (postId 또는 orderId)
    @Column(name = "related_id")
    private Long relatedId;

    // 관련 타입 (POST, ORDER)
    @Column(name = "related_type", length = 20)
    private String relatedType;

    @Builder.Default
    @Column(name = "is_read")
    private Boolean isRead = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
