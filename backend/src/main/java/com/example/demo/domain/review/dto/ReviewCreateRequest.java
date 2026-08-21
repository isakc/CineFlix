package com.example.demo.domain.review.dto;

import com.example.demo.domain.review.entity.Review;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCreateRequest {

    @NotNull(message = "영화 ID는 필수입니다.")
    private Long tmdbMovieId;

    @NotBlank(message = "작성자 이름은 필수입니다.")
    private String author;

    @NotNull(message = "별점은 필수입니다.")
    @DecimalMin(value = "0.5", message = "별점은 최소 0.5점 이상이어야 합니다.")
    @DecimalMax(value = "5.0", message = "별점은 최대 5.0점까지 가능합니다.")
    private Double rating;

    private String content;

    public Review toEntity() {
        return Review.builder()
                .tmdbMovieId(tmdbMovieId)
                .author(author)
                .rating(rating)
                .content(content)
                .build();
    }
}
