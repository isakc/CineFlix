package com.example.demo.domain.news.controller;

import com.example.demo.domain.news.dto.MovieNewsDto;
import com.example.demo.domain.news.service.MovieNewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class MovieNewsController {

    private final MovieNewsService movieNewsService;

    @GetMapping
    public ResponseEntity<List<MovieNewsDto>> getMovieNews(
            @RequestParam(required = false, defaultValue = "영화") String query) {
        List<MovieNewsDto> news = movieNewsService.getMovieNews(query);
        return ResponseEntity.ok(news);
    }
}
