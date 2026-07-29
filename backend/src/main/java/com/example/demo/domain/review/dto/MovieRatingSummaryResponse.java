package com.example.demo.domain.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MovieRatingSummaryResponse {

    private final Long tmdbMovieId;
    private final Double averageRating;
    private final long totalReviewCount;
}
