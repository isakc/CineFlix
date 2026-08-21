package com.example.demo.domain.review.service;

import com.example.demo.domain.movie.client.TmdbApiClient;
import com.example.demo.domain.review.dto.*;
import com.example.demo.domain.review.entity.Review;
import com.example.demo.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TmdbApiClient tmdbApiClient;

    @Transactional
    public Long createReview(ReviewCreateRequest request) {
        String cleanContent = request.getContent() != null ? request.getContent().trim() : "";
        var existingOpt = reviewRepository.findByTmdbMovieIdAndAuthor(request.getTmdbMovieId(), request.getAuthor());
        if (existingOpt.isPresent()) {
            Review existing = existingOpt.get();
            String contentToSet = (!cleanContent.isEmpty()) ? cleanContent : (existing.getContent() != null ? existing.getContent() : "");
            existing.update(request.getRating(), contentToSet);
            return existing.getId();
        } else {
            Review review = Review.builder()
                    .tmdbMovieId(request.getTmdbMovieId())
                    .author(request.getAuthor())
                    .rating(request.getRating())
                    .content(cleanContent)
                    .build();
            return reviewRepository.save(review).getId();
        }
    }

    public List<UserReviewResponse> getMyReviews(String author) {
        List<Review> reviews = reviewRepository.findByAuthorOrderByCreatedAtDesc(author);
        return reviews.stream().map(review -> {
            String title = "영화 #" + review.getTmdbMovieId();
            String poster = "";
            try {
                var movieDto = tmdbApiClient.getMovieDetails(review.getTmdbMovieId());
                if (movieDto != null) {
                    if (movieDto.getTitle() != null && !movieDto.getTitle().isBlank()) {
                        title = movieDto.getTitle();
                    }
                    if (movieDto.getPosterPath() != null) {
                        poster = movieDto.getPosterPath();
                    }
                }
            } catch (Exception ignored) {}

            return UserReviewResponse.builder()
                    .id(review.getId())
                    .tmdbMovieId(review.getTmdbMovieId())
                    .movieTitle(title)
                    .moviePosterPath(poster)
                    .author(review.getAuthor())
                    .rating(review.getRating())
                    .content(review.getContent())
                    .createdAt(review.getCreatedAt())
                    .updatedAt(review.getUpdatedAt())
                    .build();
        }).toList();
    }

    public Page<ReviewResponse> getReviewsByMovieId(Long tmdbMovieId, Pageable pageable) {
        return reviewRepository.findByTmdbMovieIdWithContent(tmdbMovieId, pageable)
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
