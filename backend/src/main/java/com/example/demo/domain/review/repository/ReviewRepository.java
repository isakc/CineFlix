package com.example.demo.domain.review.repository;

import com.example.demo.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByTmdbMovieId(Long tmdbMovieId, Pageable pageable);

    java.util.List<Review> findByAuthorOrderByCreatedAtDesc(String author);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.tmdbMovieId = :tmdbMovieId")
    Optional<Double> findAverageRatingByTmdbMovieId(@Param("tmdbMovieId") Long tmdbMovieId);

    long countByTmdbMovieId(Long tmdbMovieId);
}
