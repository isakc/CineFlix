package com.example.demo.domain.movie.client;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Dedicated Client for Crawling KOBIS Real-time Ticket Reservation Data
 */
@Slf4j
@Component
public class KobisCrawlerClient {

    private final Map<String, List<CrawledReservationItem>> cache = new ConcurrentHashMap<>();
    private final Map<String, Long> cacheTimestamp = new ConcurrentHashMap<>();
    private static final long CACHE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

    public List<CrawledReservationItem> getRealTimeReservationRankings() {
        String cacheKey = "kobis_realtime_scraping_cache";
        long now = System.currentTimeMillis();

        if (cache.containsKey(cacheKey) && cacheTimestamp.containsKey(cacheKey)) {
            if (now - cacheTimestamp.get(cacheKey) < CACHE_EXPIRATION_MS) {
                log.info("Returning 10-minute cached KOBIS real-time reservation rankings");
                return cache.get(cacheKey);
            }
        }

        List<CrawledReservationItem> items = crawlKobisPage();
        if (!items.isEmpty()) {
            cache.put(cacheKey, items);
            cacheTimestamp.put(cacheKey, now);
        }
        return items;
    }

    private List<CrawledReservationItem> crawlKobisPage() {
        List<CrawledReservationItem> items = new ArrayList<>();
        try {
            log.info("Connecting to KOBIS findRealTicketList.do for scraping...");
            Document doc = Jsoup.connect("https://www.kobis.or.kr/kobis/business/stat/boxs/findRealTicketList.do")
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                    .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                    .data("dmlMode", "search")
                    .data("loadEnd", "0")
                    .data("sMultiChk", "YYY")
                    .data("sNomal", "Y")
                    .data("sMulti", "Y")
                    .data("sIndie", "Y")
                    .timeout(10000)
                    .post();

            Elements rows = doc.select("tr");
            int rankCounter = 1;
            for (Element row : rows) {
                if (rankCounter > 10) break;

                Element titleLink = row.selectFirst("td.tal a, span.ellip a, a[href*=searchMovieList]");
                Elements tars = row.select("td.tar");

                if (titleLink != null) {
                    String title = titleLink.text().trim();
                    String share = !tars.isEmpty() ? tars.get(0).text().trim() : "0.0%";
                    Elements tds = row.select("td");
                    String openDt = tds.size() > 2 ? tds.get(2).text().trim() : "";

                    if (!title.isBlank() && !title.contains("영화명")) {
                        items.add(new CrawledReservationItem(String.valueOf(rankCounter++), title, share, openDt));
                    }
                }
            }
            log.info("Successfully scraped {} real-time reservation items from KOBIS", items.size());
        } catch (Exception e) {
            log.error("Failed to crawl KOBIS real-time reservation page: {}", e.getMessage());
        }
        return items;
    }

    public record CrawledReservationItem(String rank, String title, String share, String openDt) {}
}
