package com.example.demo.domain.movie.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "TMDB 영화 비디오/예고편 DTO")
public class TmdbVideoDto {

    @Schema(description = "비디오 ID", example = "64a...")
    private String id;

    @Schema(description = "비디오 제목", example = "공식 메인 예고편")
    private String name;

    @Schema(description = "유튜브 영상 키", example = "zSWdZVtXT7E")
    private String key;

    @Schema(description = "동영상 플랫폼", example = "YouTube")
    private String site;

    @Schema(description = "비디오 타입 (Trailer, Teaser, Clip 등)", example = "Trailer")
    private String type;

    @Schema(description = "공식 영상 여부", example = "true")
    private Boolean official;

    @Schema(description = "게시일시")
    @JsonProperty("published_at")
    private String publishedAt;
}
