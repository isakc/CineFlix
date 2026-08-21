package com.example.demo.domain.review.dto;

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
public class ReviewUpdateRequest {

    @NotNull(message = "별점은 필수입니다.")
    @DecimalMin(value = "0.5", message = "별점은 최소 0.5점 이상이어야 합니다.")
    @DecimalMax(value = "5.0", message = "별점은 최대 5.0점까지 가능합니다.")
    private Double rating;

    @NotBlank(message = "리뷰 내용은 필수입니다.")
    private String content;
}
