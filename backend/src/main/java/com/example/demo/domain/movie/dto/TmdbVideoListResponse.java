package com.example.demo.domain.movie.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "TMDB 영화 비디오 목록 응답")
public class TmdbVideoListResponse {

    @Schema(description = "영화 ID")
    private Long id;

    @Schema(description = "비디오/예고편 목록")
    private List<TmdbVideoDto> results;
}
