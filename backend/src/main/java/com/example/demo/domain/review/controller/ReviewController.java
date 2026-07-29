package com.example.demo.domain.review.controller;

import com.example.demo.domain.review.dto.*;
import com.example.demo.domain.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/reviews")
    public ResponseEntity<Long> createReview(@Valid @RequestBody ReviewCreateRequest request) {
        Long reviewId = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewId);
    }

    @GetMapping("/api/movies/{movieId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByMovieId(
            @PathVariable Long movieId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ReviewResponse> response = reviewService.getReviewsByMovieId(movieId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/movies/{movieId}/rating-summary")
    public ResponseEntity<MovieRatingSummaryResponse> getMovieRatingSummary(@PathVariable Long movieId) {
        MovieRatingSummaryResponse response = reviewService.getMovieRatingSummary(movieId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/reviews/{id}")
    public ResponseEntity<Long> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequest request) {
        Long updatedId = reviewService.updateReview(id, request);
        return ResponseEntity.ok(updatedId);
    }

    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
