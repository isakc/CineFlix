package com.example.demo.domain.review.dto;

import com.example.demo.domain.review.entity.Review;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
    @Min(value = 1, message = "별점은 최소 1점 이상이어야 합니다.")
    @Max(value = 5, message = "별점은 최대 5점까지 가능합니다.")
    private Double rating;

    @NotBlank(message = "리뷰 내용은 필수입니다.")
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
