package com.example.demo.domain.movie.controller;

import com.example.demo.domain.movie.dto.TmdbMovieDto;
import com.example.demo.domain.movie.dto.TmdbMovieListResponse;
import com.example.demo.domain.movie.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/popular")
    public ResponseEntity<TmdbMovieListResponse> getPopularMovies(
            @RequestParam(required = false) String targetDt,
            @RequestParam(defaultValue = "1") int page) {
        TmdbMovieListResponse response = (targetDt != null && !targetDt.isBlank())
                ? movieService.getDailyBoxOfficeByDate(targetDt, page)
                : movieService.getPopularMovies(page);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/top-rated")
    public ResponseEntity<TmdbMovieListResponse> getTopRatedMovies(
            @RequestParam(required = false) Integer genreId,
            @RequestParam(defaultValue = "1") int page) {
        TmdbMovieListResponse response = movieService.getTopRatedMoviesByGenre(genreId, page);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<TmdbMovieListResponse> searchMovies(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        TmdbMovieListResponse response = movieService.searchMovies(query, page);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TmdbMovieDto> getMovieDetails(@PathVariable Long id) {
        TmdbMovieDto response = movieService.getMovieDetails(id);
        return ResponseEntity.ok(response);
    }
}
