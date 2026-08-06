package com.example.demo.domain.playlist.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "플레이리스트 영화 추가 요청 DTO")
public class PlaylistItemAddRequest {

    @Schema(description = "TMDB 영화 ID", example = "157336")
    @NotNull
    private Long tmdbMovieId;

    @Schema(description = "영화 제목", example = "인터스텔라")
    @NotBlank
    private String movieTitle;

    @Schema(description = "포스터 경로", example = "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg")
    private String posterPath;
}
