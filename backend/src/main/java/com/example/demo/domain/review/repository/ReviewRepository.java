package com.example.demo.domain.review.repository;

import com.example.demo.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r WHERE r.tmdbMovieId = :tmdbMovieId AND r.content IS NOT NULL AND TRIM(r.content) <> '' ORDER BY r.createdAt DESC")
    Page<Review> findByTmdbMovieIdWithContent(@Param("tmdbMovieId") Long tmdbMovieId, Pageable pageable);

    Page<Review> findByTmdbMovieId(Long tmdbMovieId, Pageable pageable);

    List<Review> findByAuthorOrderByCreatedAtDesc(String author);

    Optional<Review> findByTmdbMovieIdAndAuthor(Long tmdbMovieId, String author);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.tmdbMovieId = :tmdbMovieId")
    Optional<Double> findAverageRatingByTmdbMovieId(@Param("tmdbMovieId") Long tmdbMovieId);

    long countByTmdbMovieId(Long tmdbMovieId);
}
