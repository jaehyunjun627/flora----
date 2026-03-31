package com.flora.backend.service;

import com.flora.backend.entity.Notification;
import com.flora.backend.entity.User;
import com.flora.backend.repository.jpa.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // 알림 생성
    @Transactional
    public void create(User targetUser, String type, String message, Long relatedId, String relatedType) {
        Notification notification = Notification.builder()
                .user(targetUser)
                .type(type)
                .message(message)
                .relatedId(relatedId)
                .relatedType(relatedType)
                .build();
        notificationRepository.save(notification);
    }

    // 읽지 않은 알림 수
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // 알림 목록 조회
    public List<Map<String, Object>> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(50)
                .map(n -> Map.<String, Object>of(
                        "id", n.getId(),
                        "type", n.getType(),
                        "message", n.getMessage(),
                        "relatedId", n.getRelatedId() != null ? n.getRelatedId() : 0L,
                        "relatedType", n.getRelatedType() != null ? n.getRelatedType() : "",
                        "isRead", n.getIsRead(),
                        "createdAt", n.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    // 단일 알림 읽음 처리
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.markAsRead(notificationId, userId);
    }

    // 전체 알림 읽음 처리
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }
}
