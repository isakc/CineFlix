package com.example.demo.domain.movie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmdbImagesResponse {

    private Long id;
    private List<TmdbImageDto> backdrops;
    private List<TmdbImageDto> posters;
    private List<TmdbImageDto> logos;
}
