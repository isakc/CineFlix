package com.example.demo.domain.movie.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmdbImageDto {

    @JsonProperty("file_path")
    private String filePath;

    @JsonProperty("aspect_ratio")
    private Double aspectRatio;

    private Integer height;

    private Integer width;

    @JsonProperty("vote_average")
    private Double voteAverage;

    @JsonProperty("vote_count")
    private Integer voteCount;
}
