package com.flora.backend.dto;

import com.flora.backend.entity.Post;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostDto {
    private Long id;
    private Long userId;
    private String userNickname;

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자 이하여야 합니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @NotBlank(message = "카테고리는 필수입니다")
    private String category;
    private String locationCity;
    private Double latitude;
    private Double longitude;
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
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
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
