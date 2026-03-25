package com.flora.backend.dto;

import com.flora.backend.entity.Post;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostDto {
    private Long id;
    private Long userId;
    private String userNickname;
    private String title;
    private String content;
    private String category;
    private String locationCity;
    private Integer viewCount;
    private Integer likeCount;
    private Boolean isPinned;
    private String tag;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PostDto from(Post p) {
        return PostDto.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .userNickname(p.getUser().getNickname())
                .title(p.getTitle())
                .content(p.getContent())
                .category(p.getCategory())
                .locationCity(p.getLocationCity())
                .viewCount(p.getViewCount())
                .likeCount(p.getLikeCount())
                .isPinned(p.getIsPinned())
                .tag(p.getTag())
                .isActive(p.getIsActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
