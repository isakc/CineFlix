package com.example.demo.domain.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserReviewResponse {

    private Long id;
    private Long tmdbMovieId;
    private String movieTitle;
    private String moviePosterPath;
    private String author;
    private Double rating;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
