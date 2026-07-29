package com.example.demo.domain.review.service;

import com.example.demo.domain.review.dto.*;
import com.example.demo.domain.review.entity.Review;
import com.example.demo.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Transactional
    public Long createReview(ReviewCreateRequest request) {
        Review review = request.toEntity();
        return reviewRepository.save(review).getId();
    }

    public Page<ReviewResponse> getReviewsByMovieId(Long tmdbMovieId, Pageable pageable) {
        return reviewRepository.findByTmdbMovieId(tmdbMovieId, pageable)
                .map(ReviewResponse::new);
    }

    public MovieRatingSummaryResponse getMovieRatingSummary(Long tmdbMovieId) {
        Double avgRating = reviewRepository.findAverageRatingByTmdbMovieId(tmdbMovieId).orElse(0.0);
        double roundedAvg = Math.round(avgRating * 10.0) / 10.0;
        long totalCount = reviewRepository.countByTmdbMovieId(tmdbMovieId);

        return MovieRatingSummaryResponse.builder()
                .tmdbMovieId(tmdbMovieId)
                .averageRating(roundedAvg)
                .totalReviewCount(totalCount)
                .build();
    }

    @Transactional
    public Long updateReview(Long reviewId, ReviewUpdateRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("해당 리뷰를 찾을 수 없습니다. id=" + reviewId));
        review.update(request.getRating(), request.getContent());
        return reviewId;
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("해당 리뷰를 찾을 수 없습니다. id=" + reviewId));
        reviewRepository.delete(review);
    }
}
