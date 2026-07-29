package com.example.demo.domain.news.service;

import com.example.demo.domain.news.client.NaverNewsClient;
import com.example.demo.domain.news.dto.MovieNewsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieNewsService {

    private final NaverNewsClient naverNewsClient;

    public List<MovieNewsDto> getMovieNews(String query) {
        String searchQuery = (query != null && !query.isBlank()) ? query : "영화";
        return naverNewsClient.fetchMovieNews(searchQuery);
    }
}
