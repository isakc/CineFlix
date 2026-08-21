package com.example.demo.domain.movie.controller;

import com.example.demo.domain.movie.dto.TmdbMovieDto;
import com.example.demo.domain.movie.dto.TmdbMovieListResponse;
import com.example.demo.domain.movie.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Movie API", description = "영화 박스오피스 순위, 카테고리별 조회, 검색 및 추천 API")
@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @Operation(summary = "박스오피스 인기 영화 조회", description = "현재 박스오피스 실시간 인기 영화 1위~10위 목록을 조회합니다.")
    @GetMapping({"/popular", "/rankings"})
    public ResponseEntity<TmdbMovieListResponse> getPopularMovies(
            @RequestParam(required = false) String targetDt,
            @RequestParam(defaultValue = "1") int page) {
        TmdbMovieListResponse response = (targetDt != null && !targetDt.isBlank())
                ? movieService.getDailyBoxOfficeByDate(targetDt, page)
                : movieService.getPopularMovies(page);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "장르별/카테고리별 명작 영화 조회", description = "장르 ID별 높은 평점의 대표 명작 영화를 조회합니다.")
    @GetMapping("/top-rated")
    public ResponseEntity<TmdbMovieListResponse> getTopRatedMovies(
            @RequestParam(required = false) Integer genreId,
            @RequestParam(defaultValue = "1") int page) {
        TmdbMovieListResponse response = movieService.getTopRatedMoviesByGenre(genreId, page);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "영화 제목 키워드 검색", description = "영화 제목으로 키워드 검색 결과를 반환합니다.")
    @GetMapping("/search")
    public ResponseEntity<TmdbMovieListResponse> searchMovies(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        TmdbMovieListResponse response = movieService.searchMovies(query, page);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "영화 상세 정보 조회", description = "특정 TMDB 영화 ID로 상세 정보(줄거리, 평점, 개봉일 등)를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<TmdbMovieDto> getMovieDetails(@PathVariable Long id) {
        TmdbMovieDto response = movieService.getMovieDetails(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "영화 출연진(배우) 정보 조회", description = "특정 TMDB 영화 ID로 출연 배우 목록과 배역명, 프로필 사진을 조회합니다.")
    @GetMapping("/{id}/credits")
    public ResponseEntity<com.example.demo.domain.movie.dto.TmdbCreditsResponse> getMovieCredits(@PathVariable Long id) {
        com.example.demo.domain.movie.dto.TmdbCreditsResponse response = movieService.getMovieCredits(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "영화 예고편(트레일러/비디오) 조회", description = "특정 TMDB 영화 ID로 공식 유튜브 예고편 및 티저 비디오 목록을 조회합니다.")
    @GetMapping({"/{id}/videos", "/{id}/trailer"})
    public ResponseEntity<com.example.demo.domain.movie.dto.TmdbVideoListResponse> getMovieVideos(@PathVariable Long id) {
        com.example.demo.domain.movie.dto.TmdbVideoListResponse response = movieService.getMovieVideos(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "AI 사용자 맞춤 영화 추천", description = "사용자의 위시리스트 취향을 분석하여 맞춤 연관 영화 목록을 제공합니다.")
    @GetMapping("/recommendations")
    public ResponseEntity<TmdbMovieListResponse> getRecommendedMovies(
            @RequestParam(required = false) String userIdentifier) {
        TmdbMovieListResponse response = movieService.getRecommendedMovies(userIdentifier);
        return ResponseEntity.ok(response);
    }
}
