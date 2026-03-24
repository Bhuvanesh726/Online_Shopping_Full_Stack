package com.shopease.dto;

import lombok.*;
import java.time.LocalDateTime;

public class ReviewDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewRequest {
        private Integer rating;
        private String comment;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewResponse {
        private Long id;
        private Long userId;
        private String userName;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
    }
}
