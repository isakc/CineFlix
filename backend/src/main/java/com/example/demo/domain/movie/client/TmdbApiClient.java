package com.example.demo.domain.movie.client;

import com.example.demo.domain.movie.dto.TmdbMovieDto;
import com.example.demo.domain.movie.dto.TmdbMovieListResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Dedicated Client for TMDB Open API Communication
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TmdbApiClient {

    private final RestClient restClient;

    @Value("${tmdb.api.base-url:https://api.themoviedb.org/3}")
    private String baseUrl;

    @Value("${tmdb.api.key:YOUR_TMDB_API_KEY_HERE}")
    private String apiKey;

    private boolean isInvalidApiKey() {
        return apiKey == null || apiKey.isBlank() || "sample_key".equals(apiKey) || "YOUR_TMDB_API_KEY_HERE".equals(apiKey) || apiKey.startsWith("YOUR_");
    }

    public TmdbMovieListResponse getTopRatedMoviesByGenre(Integer genreId, int page) {
        if (isInvalidApiKey()) {
            return getMockSearchResults("Top Rated Movie");
        }

        try {
            // First try min 10,000 global votes for ultra-high sample size S-tier masterpieces
            TmdbMovieListResponse response = fetchTopRatedWithVoteThreshold(genreId, page, 10000);
            if (response != null && response.getResults() != null && response.getResults().size() >= 10) {
                return response;
            }

            // Fallback to min 5,000 votes if a specific genre has fewer than 10 movies at 10k threshold
            log.info("Fewer than 10 movies found with 10,000 votes for genreId={}. Falling back to 5,000 votes threshold.", genreId);
            TmdbMovieListResponse fallbackResponse = fetchTopRatedWithVoteThreshold(genreId, page, 5000);
            if (fallbackResponse != null && fallbackResponse.getResults() != null && !fallbackResponse.getResults().isEmpty()) {
                return fallbackResponse;
            }

            return response != null ? response : getMockSearchResults("Top Rated Movie");
        } catch (Exception e) {
            log.error("Failed to fetch top-rated movies from TMDB (genreId={}): {}", genreId, e.getMessage());
            return getMockSearchResults("Top Rated Movie");
        }
    }

    private TmdbMovieListResponse fetchTopRatedWithVoteThreshold(Integer genreId, int page, int minVotes) {
        if (genreId != null && genreId > 0) {
            log.info("Fetching TMDB top-rated movies by genreId={}, page={} (min {} votes)", genreId, page, minVotes);
            return restClient.get()
                    .uri(baseUrl + "/discover/movie?api_key={apiKey}&language=ko-KR&sort_by=vote_average.desc&vote_count.gte={minVotes}&with_genres={genreId}&page={page}", 
                         apiKey, minVotes, genreId, page)
                    .retrieve()
                    .body(TmdbMovieListResponse.class);
        } else {
            log.info("Fetching TMDB top-rated movies for all categories, page={} (min {} votes)", page, minVotes);
            return restClient.get()
                    .uri(baseUrl + "/discover/movie?api_key={apiKey}&language=ko-KR&sort_by=vote_average.desc&vote_count.gte={minVotes}&page={page}", 
                         apiKey, minVotes, page)
                    .retrieve()
                    .body(TmdbMovieListResponse.class);
        }
    }

    public TmdbMovieListResponse searchMovieByTitleAndYear(String query, String openDt, int page) {
        if (isInvalidApiKey()) {
            return getMockSearchResults(query);
        }

        String year = (openDt != null && openDt.length() >= 4) ? openDt.substring(0, 4) : "";

        try {
            if (!year.isBlank()) {
                TmdbMovieListResponse yearMatch = restClient.get()
                        .uri(baseUrl + "/search/movie?api_key={apiKey}&language=ko-KR&query={query}&primary_release_year={year}&page={page}", 
                             apiKey, query, year, page)
                        .retrieve()
                        .body(TmdbMovieListResponse.class);

                if (yearMatch != null && yearMatch.getResults() != null && !yearMatch.getResults().isEmpty()) {
                    return yearMatch;
                }
            }

            return restClient.get()
                    .uri(baseUrl + "/search/movie?api_key={apiKey}&language=ko-KR&query={query}&page={page}", apiKey, query, page)
                    .retrieve()
                    .body(TmdbMovieListResponse.class);
        } catch (Exception e) {
            log.error("Failed to search movie '{}' from TMDB API: {}", query, e.getMessage());
            return getMockSearchResults(query);
        }
    }

    public TmdbMovieDto getMovieDetails(Long movieId) {
        if (isInvalidApiKey()) {
            return getMockMovieDetail(movieId);
        }

        try {
            return restClient.get()
                    .uri(baseUrl + "/movie/{movieId}?api_key={apiKey}&language=ko-KR", movieId, apiKey)
                    .retrieve()
                    .body(TmdbMovieDto.class);
        } catch (Exception e) {
            log.error("Failed to fetch movie details for ID {}: {}", movieId, e.getMessage());
            return getMockMovieDetail(movieId);
        }
    }

    public TmdbMovieListResponse getMovieRecommendations(Long movieId) {
        if (isInvalidApiKey()) {
            return getMockSearchResults("Recommended Movie");
        }

        try {
            return restClient.get()
                    .uri(baseUrl + "/movie/{movieId}/recommendations?api_key={apiKey}&language=ko-KR&page=1", movieId, apiKey)
                    .retrieve()
                    .body(TmdbMovieListResponse.class);
        } catch (Exception e) {
            log.error("Failed to fetch movie recommendations for TMDB ID {}: {}", movieId, e.getMessage());
            return getMockSearchResults("Recommended Movie");
        }
    }

    private TmdbMovieListResponse getMockSearchResults(String query) {
        return TmdbMovieListResponse.builder()
                .page(1)
                .results(List.of(
                        TmdbMovieDto.builder()
                                .id((long) (Math.abs(query.hashCode()) + 1000))
                                .title(query)
                                .originalTitle(query)
                                .overview(query + " 영화 정보입니다.")
                                .posterPath("/pB82tRdUZkn8GCHX9W3G1v9v5d.jpg")
                                .releaseDate("2026-07-01")
                                .voteAverage(8.5)
                                .voteCount(1200)
                                .build()
                ))
                .totalPages(1)
                .totalResults(1)
                .build();
    }

    private TmdbMovieDto getMockMovieDetail(Long movieId) {
        return TmdbMovieDto.builder()
                .id(movieId)
                .title("영화 정보 (" + movieId + ")")
                .originalTitle("Movie Detail")
                .overview("상세 줄거리 정보입니다.")
                .releaseDate("2026-01-01")
                .voteAverage(8.5)
                .voteCount(1200)
                .build();
    }
}
