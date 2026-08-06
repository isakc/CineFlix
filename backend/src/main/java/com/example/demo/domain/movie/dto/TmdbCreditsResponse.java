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
@Schema(description = "영화 출연진 응답 DTO")
public class TmdbCreditsResponse {

    @Schema(description = "영화 ID")
    private Long id;

    @Schema(description = "출연 배우 목록")
    private List<TmdbCastDto> cast;
}
