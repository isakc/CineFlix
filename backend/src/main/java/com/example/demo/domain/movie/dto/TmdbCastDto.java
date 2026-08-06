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
@Schema(description = "영화 출연진(배우) DTO")
public class TmdbCastDto {

    @Schema(description = "배우 TMDB ID", example = "31")
    private Long id;

    @Schema(description = "배우 이름", example = "톰 행크스")
    private String name;

    @Schema(description = "극중 극명/배역", example = "포레스트 검프")
    private String character;

    @Schema(description = "프로필 사진 경로", example = "/mAtm8x580qBf798Xq666mF8Y3d.jpg")
    @JsonProperty("profile_path")
    private String profilePath;
}
