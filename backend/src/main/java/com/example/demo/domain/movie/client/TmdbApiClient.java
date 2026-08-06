package com.example.demo.domain.movie.client;

import com.example.demo.domain.movie.dto.TmdbCastDto;
import com.example.demo.domain.movie.dto.TmdbCreditsResponse;
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
            TmdbMovieListResponse response = fetchTopRatedWithVoteThreshold(genreId, page, 10000);
            if (response != null && response.getResults() != null && response.getResults().size() >= 10) {
                return response;
            }

            response = fetchTopRatedWithVoteThreshold(genreId, page, 5000);
            if (response != null && response.getResults() != null && !response.getResults().isEmpty()) {
                return response;
            }

            return fetchTopRatedWithVoteThreshold(genreId, page, 1000);
        } catch (Exception e) {
            log.error("Failed to fetch top rated movies by genre {}: {}", genreId, e.getMessage());
            return getMockSearchResults("Masterpiece");
        }
    }

    private TmdbMovieListResponse fetchTopRatedWithVoteThreshold(Integer genreId, int page, int minVotes) {
        String uri = (genreId == null || genreId == 0)
                ? String.format("%s/discover/movie?api_key=%s&language=ko-KR&sort_by=vote_average.desc&vote_count.gte=%d&page=%d", baseUrl, apiKey, minVotes, page)
                : String.format("%s/discover/movie?api_key=%s&language=ko-KR&sort_by=vote_average.desc&vote_count.gte=%d&with_genres=%d&page=%d", baseUrl, apiKey, minVotes, genreId, page);

        return restClient.get()
                .uri(uri)
                .retrieve()
                .body(TmdbMovieListResponse.class);
    }

    public TmdbMovieListResponse searchMovieByTitleAndYear(String query, String releaseYear, int page) {
        if (isInvalidApiKey()) {
            return getMockSearchResults(query);
        }

        try {
            if (releaseYear != null && releaseYear.length() >= 4) {
                String year = releaseYear.substring(0, 4);
                TmdbMovieListResponse yearMatch = restClient.get()
                        .uri(baseUrl + "/search/movie?api_key={apiKey}&language=ko-KR&query={query}&primary_release_year={year}&page={page}", apiKey, query, year, page)
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

    public TmdbCreditsResponse getMovieCredits(Long movieId) {
        if (isInvalidApiKey()) {
            return getMockMovieCredits(movieId);
        }

        try {
            TmdbCreditsResponse res = restClient.get()
                    .uri(baseUrl + "/movie/{movieId}/credits?api_key={apiKey}&language=ko-KR", movieId, apiKey)
                    .retrieve()
                    .body(TmdbCreditsResponse.class);

            if (res != null && res.getCast() != null && !res.getCast().isEmpty()) {
                return res;
            }
        } catch (Exception e) {
            log.error("Failed to fetch movie credits for TMDB ID {}: {}", movieId, e.getMessage());
        }

        return getMockMovieCredits(movieId);
    }

    private TmdbCreditsResponse getMockMovieCredits(Long movieId) {
        return TmdbCreditsResponse.builder()
                .id(movieId)
                .cast(List.of(
                        TmdbCastDto.builder().id(101L).name("톰 행크스").character("주연 배우").profilePath("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop").build(),
                        TmdbCastDto.builder().id(102L).name("엠마 스톤").character("주연 배우").profilePath("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop").build(),
                        TmdbCastDto.builder().id(103L).name("크리스토퍼 놀란").character("감독 / 출연").profilePath("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop").build(),
                        TmdbCastDto.builder().id(104L).name("스칼렛 요한슨").character("조연 배우").profilePath("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop").build()
                ))
                .build();
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
