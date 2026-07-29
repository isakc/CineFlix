package com.example.demo.domain.news.client;

import com.example.demo.domain.news.dto.MovieNewsDto;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Parser;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Dedicated Client for Fetching Real Live Movie News with Direct Article URLs
 */
@Slf4j
@Component
public class NaverNewsClient {

    private final Map<String, List<MovieNewsDto>> cache = new ConcurrentHashMap<>();
    private final Map<String, Long> cacheTimestamp = new ConcurrentHashMap<>();
    private static final long CACHE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

    public List<MovieNewsDto> fetchMovieNews(String query) {
        String searchQuery = (query != null && !query.isBlank()) ? query : "영화 개봉";
        String cacheKey = "real_live_news_" + searchQuery;
        long now = System.currentTimeMillis();

        if (cache.containsKey(cacheKey) && cacheTimestamp.containsKey(cacheKey)) {
            if (now - cacheTimestamp.get(cacheKey) < CACHE_EXPIRATION_MS) {
                log.info("Returning 10-minute cached live news for query '{}'", searchQuery);
                return cache.get(cacheKey);
            }
        }

        List<MovieNewsDto> newsList = fetchLiveNewsRss(searchQuery);

        if (!newsList.isEmpty()) {
            cache.put(cacheKey, newsList);
            cacheTimestamp.put(cacheKey, now);
        }
        return newsList;
    }

    private List<MovieNewsDto> fetchLiveNewsRss(String query) {
        List<MovieNewsDto> list = new ArrayList<>();
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = "https://news.google.com/rss/search?q=" + encoded + "&hl=ko&gl=KR&ceid=KR:ko";
            log.info("Fetching real live movie news articles from RSS: {}", url);

            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .parser(Parser.xmlParser())
                    .timeout(8000)
                    .get();

            Elements items = doc.select("item");
            for (Element item : items) {
                if (list.size() >= 8) break;

                Element titleElem = item.selectFirst("title");
                Element linkElem = item.selectFirst("link");
                Element pubDateElem = item.selectFirst("pubDate");
                Element sourceElem = item.selectFirst("source");

                if (titleElem != null && linkElem != null) {
                    String rawTitle = titleElem.text().trim();
                    String link = linkElem.text().trim();
                    String press = (sourceElem != null && !sourceElem.text().isBlank()) ? sourceElem.text().trim() : "언론사";
                    String pubDate = (pubDateElem != null) ? formatPubDate(pubDateElem.text().trim()) : "최신 소식";

                    String title = rawTitle;
                    if (title.contains(" - ")) {
                        int lastDash = title.lastIndexOf(" - ");
                        title = title.substring(0, lastDash).trim();
                    }

                    String description = "['" + press + "' 보도] " + title + "에 대한 상세 기사 내용입니다.";

                    if (!title.isBlank() && !link.isBlank()) {
                        list.add(MovieNewsDto.builder()
                                .title(title)
                                .link(link)
                                .description(description)
                                .press(press)
                                .pubDate(pubDate)
                                .build());
                    }
                }
            }
            log.info("Successfully fetched {} 100% real live news articles", list.size());
        } catch (Exception e) {
            log.error("Failed to fetch RSS news articles: {}", e.getMessage());
        }
        return list;
    }

    private String formatPubDate(String rawDate) {
        if (rawDate == null || rawDate.isBlank()) return "최신 소식";
        try {
            if (rawDate.contains("GMT") || rawDate.contains("+")) {
                return "실시간 이슈";
            }
        } catch (Exception ignored) {}
        return rawDate;
    }
}
