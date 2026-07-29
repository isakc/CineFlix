package com.example.demo.domain.review.dto;

import com.example.demo.domain.review.entity.Review;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ReviewResponse {

    private final Long id;
    private final Long tmdbMovieId;
    private final String author;
    private final Double rating;
    private final String content;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public ReviewResponse(Review review) {
        this.id = review.getId();
        this.tmdbMovieId = review.getTmdbMovieId();
        this.author = review.getAuthor();
        this.rating = review.getRating();
        this.content = review.getContent();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
    }
}
