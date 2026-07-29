package com.example.demo.domain.review.entity;

import com.example.demo.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reviews", indexes = {
        @Index(name = "idx_review_movie_id", columnList = "tmdbMovieId")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Review extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long tmdbMovieId;

    @Column(nullable = false, length = 50)
    private String author;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder
    public Review(Long tmdbMovieId, String author, Double rating, String content) {
        this.tmdbMovieId = tmdbMovieId;
        this.author = author;
        this.rating = rating;
        this.content = content;
    }

    public void update(Double rating, String content) {
        this.rating = rating;
        this.content = content;
    }
}
