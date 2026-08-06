package com.example.demo.domain.movie.service;

import com.example.demo.domain.movie.client.KobisCrawlerClient;
import com.example.demo.domain.movie.client.KobisCrawlerClient.CrawledReservationItem;
import com.example.demo.domain.movie.client.TmdbApiClient;
import com.example.demo.domain.movie.dto.KobisBoxOfficeResponse;
import com.example.demo.domain.movie.dto.KobisDailyBoxOfficeDto;
import com.example.demo.domain.movie.dto.TmdbMovieDto;
import com.example.demo.domain.movie.dto.TmdbMovieListResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.example.demo.domain.wishlist.entity.Wishlist;
import com.example.demo.domain.wishlist.repository.WishlistRepository;

/**
 * Domain Service for Movie Box Office & Real-time Rankings Orchestration
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MovieService {

    private final KobisCrawlerClient kobisCrawlerClient;
    private final TmdbApiClient tmdbApiClient;
    private final WishlistRepository wishlistRepository;
    private final RestClient restClient;
    private final ExecutorService executor = Executors.newFixedThreadPool(10);

    @Value("${kobis.api.base-url:http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice}")
    private String kobisBaseUrl;

    @Value("${kobis.api.key:YOUR_KOBIS_API_KEY_HERE}")
    private String kobisApiKey;

    public TmdbMovieListResponse getPopularMovies(int page) {
        List<CrawledReservationItem> crawledList = kobisCrawlerClient.getRealTimeReservationRankings();

        if (!crawledList.isEmpty()) {
            List<CompletableFuture<TmdbMovieDto>> futures = crawledList.stream()
                    .map(item -> CompletableFuture.supplyAsync(() -> processCrawledItem(item), executor))
                    .toList();

            List<TmdbMovieDto> matchedMovies = futures.stream()
                    .map(CompletableFuture::join)
                    .toList();

            return TmdbMovieListResponse.builder()
                    .page(1)
                    .results(matchedMovies)
                    .totalPages(1)
                    .totalResults(matchedMovies.size())
                    .build();
        }

        String yesterday = LocalDate.now().minusDays(1).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return getDailyBoxOfficeByDate(yesterday, page);
    }

    public TmdbMovieListResponse getTopRatedMoviesByGenre(Integer genreId, int page) {
        return tmdbApiClient.getTopRatedMoviesByGenre(genreId, page);
    }

    private TmdbMovieDto processCrawledItem(CrawledReservationItem item) {
        String movieNm = item.title();
        String rank = item.rank();
        String openDt = item.openDt();

        TmdbMovieListResponse tmdbSearch = tmdbApiClient.searchMovieByTitleAndYear(movieNm, openDt, 1);
        TmdbMovieDto topMatch = (tmdbSearch != null && tmdbSearch.getResults() != null && !tmdbSearch.getResults().isEmpty()) 
                ? tmdbSearch.getResults().get(0) : null;

        String posterPath = (topMatch != null && topMatch.getPosterPath() != null && !topMatch.getPosterPath().isBlank())
                ? topMatch.getPosterPath() : "/pB82tRdUZkn8GCHX9W3G1v9v5d.jpg";
        
        String overview = (topMatch != null && topMatch.getOverview() != null && !topMatch.getOverview().isBlank()) 
                ? topMatch.getOverview() : movieNm + " 영화의 줄거리 및 상세 정보입니다.";

        String rankEmoji = switch (rank) {
            case "1" -> "🥇 1위. ";
            case "2" -> "🥈 2위. ";
            case "3" -> "🥉 3위. ";
            default -> rank + "위. ";
        };

        return TmdbMovieDto.builder()
                .id(topMatch != null ? topMatch.getId() : (long) (Math.abs(movieNm.hashCode()) + 10000))
                .title(movieNm)
                .originalTitle(topMatch != null ? topMatch.getOriginalTitle() : movieNm)
                .overview(overview)
                .posterPath(posterPath)
                .releaseDate(openDt.isBlank() ? LocalDate.now().toString() : openDt)
                .voteAverage(topMatch != null && topMatch.getVoteAverage() > 0 ? topMatch.getVoteAverage() : 8.0)
                .voteCount(topMatch != null && topMatch.getVoteCount() > 0 ? topMatch.getVoteCount() : 1000)
                .build();
    }

    public TmdbMovieListResponse getDailyBoxOfficeByDate(String targetDt, int page) {
        if (!"sample_key".equals(kobisApiKey)) {
            try {
                KobisBoxOfficeResponse kobisRes = restClient.get()
                        .uri(kobisBaseUrl + "/searchDailyBoxOfficeList.json?key={key}&targetDt={targetDt}", kobisApiKey, targetDt)
                        .retrieve()
                        .body(KobisBoxOfficeResponse.class);

                if (kobisRes != null && kobisRes.getBoxOfficeResult() != null && kobisRes.getBoxOfficeResult().getDailyBoxOfficeList() != null) {
                    List<KobisDailyBoxOfficeDto> list = kobisRes.getBoxOfficeResult().getDailyBoxOfficeList();

                    List<CompletableFuture<TmdbMovieDto>> futures = list.stream()
                            .map(item -> CompletableFuture.supplyAsync(() -> processDynamicKobisItem(item, targetDt), executor))
                            .toList();

                    List<TmdbMovieDto> matchedMovies = futures.stream()
                            .map(CompletableFuture::join)
                            .toList();

                    if (!matchedMovies.isEmpty()) {
                        return TmdbMovieListResponse.builder()
                                .page(1)
                                .results(matchedMovies)
                                .totalPages(1)
                                .totalResults(matchedMovies.size())
                                .build();
                    }
                }
            } catch (Exception e) {
                log.error("Failed to fetch dynamic KOBIS daily box office for {}: {}", targetDt, e.getMessage());
            }
        }
        return getPopularMovies(1);
    }

    private TmdbMovieDto processDynamicKobisItem(KobisDailyBoxOfficeDto item, String targetDt) {
        String movieNm = item.getMovieNm();
        String rank = item.getRank();
        String openDt = item.getOpenDt();

        TmdbMovieListResponse tmdbSearch = tmdbApiClient.searchMovieByTitleAndYear(movieNm, openDt, 1);
        TmdbMovieDto topMatch = (tmdbSearch != null && tmdbSearch.getResults() != null && !tmdbSearch.getResults().isEmpty()) 
                ? tmdbSearch.getResults().get(0) : null;

        String posterPath = (topMatch != null && topMatch.getPosterPath() != null && !topMatch.getPosterPath().isBlank())
                ? topMatch.getPosterPath() : "/pB82tRdUZkn8GCHX9W3G1v9v5d.jpg";
        
        String overview = (topMatch != null && topMatch.getOverview() != null && !topMatch.getOverview().isBlank()) 
                ? topMatch.getOverview() : movieNm + " 상영작 정보입니다.";

        String rankEmoji = switch (rank) {
            case "1" -> "🥇 1위. ";
            case "2" -> "🥈 2위. ";
            case "3" -> "🥉 3위. ";
            default -> rank + "위. ";
        };

        return TmdbMovieDto.builder()
                .id(topMatch != null ? topMatch.getId() : (long) (Math.abs(movieNm.hashCode()) + 10000))
                .title(movieNm)
                .originalTitle(topMatch != null ? topMatch.getOriginalTitle() : movieNm)
                .overview(overview)
                .posterPath(posterPath)
                .releaseDate(openDt != null ? openDt : LocalDate.now().minusDays(1).toString())
                .voteAverage(topMatch != null && topMatch.getVoteAverage() > 0 ? topMatch.getVoteAverage() : 8.0)
                .voteCount(topMatch != null && topMatch.getVoteCount() > 0 ? topMatch.getVoteCount() : 1000)
                .build();
    }

    public TmdbMovieListResponse searchMovies(String query, int page) {
        return tmdbApiClient.searchMovieByTitleAndYear(query, null, page);
    }

    public TmdbMovieDto getMovieDetails(Long movieId) {
        return tmdbApiClient.getMovieDetails(movieId);
    }

    public com.example.demo.domain.movie.dto.TmdbCreditsResponse getMovieCredits(Long movieId) {
        return tmdbApiClient.getMovieCredits(movieId);
    }

    public TmdbMovieListResponse getRecommendedMovies(String userIdentifier) {
        if (userIdentifier != null && !userIdentifier.isBlank()) {
            List<Wishlist> wishlists = wishlistRepository.findByUserIdentifier(userIdentifier);
            if (!wishlists.isEmpty()) {
                List<Wishlist> shuffledWishlists = new ArrayList<>(wishlists);
                Collections.shuffle(shuffledWishlists);

                List<TmdbMovieDto> combinedResults = new ArrayList<>();
                Set<Long> seenIds = new HashSet<>();

                for (Wishlist w : wishlists) {
                    if (w.getTmdbMovieId() != null) {
                        seenIds.add(w.getTmdbMovieId());
                    }
                }

                for (Wishlist w : shuffledWishlists.stream().limit(4).toList()) {
                    try {
                        TmdbMovieListResponse rec = tmdbApiClient.getMovieRecommendations(w.getTmdbMovieId());
                        if (rec != null && rec.getResults() != null) {
                            for (TmdbMovieDto movie : rec.getResults()) {
                                if (movie.getId() != null && !seenIds.contains(movie.getId())) {
                                    seenIds.add(movie.getId());
                                    combinedResults.add(movie);
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.error("Failed to fetch recommendations for movie ID {}: {}", w.getTmdbMovieId(), e.getMessage());
                    }
                }

                if (!combinedResults.isEmpty()) {
                    Collections.shuffle(combinedResults);
                    return TmdbMovieListResponse.builder()
                            .page(1)
                            .results(combinedResults)
                            .totalPages(1)
                            .totalResults(combinedResults.size())
                            .build();
                }
            }
        }
        return tmdbApiClient.getTopRatedMoviesByGenre(28, 1);
    }
}
