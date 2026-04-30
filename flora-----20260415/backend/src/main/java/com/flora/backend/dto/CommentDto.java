package com.flora.backend.dto;

import com.flora.backend.entity.Comment;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentDto {
    private Long id;
    private String targetType;
    private Long targetId;
    private Long userId;
    private String userNickname;
    private Long parentCommentId;
    private String content;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static CommentDto from(Comment c) {
        return CommentDto.builder()
                .id(c.getId())
                .targetType(c.getTargetType())
                .targetId(c.getTargetId())
                .userId(c.getUser().getId())
                .userNickname(c.getUser().getNickname())
                .parentCommentId(c.getParentCommentId())
                .content(c.getContent())
                .isActive(c.getIsActive())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
