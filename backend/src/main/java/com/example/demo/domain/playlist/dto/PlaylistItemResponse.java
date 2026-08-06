package com.example.demo.domain.playlist.dto;

import com.example.demo.domain.playlist.entity.PlaylistItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistItemResponse {
    private Long id;
    private Long tmdbMovieId;
    private String movieTitle;
    private String posterPath;
    private LocalDateTime addedAt;

    public static PlaylistItemResponse from(PlaylistItem item) {
        return PlaylistItemResponse.builder()
                .id(item.getId())
                .tmdbMovieId(item.getTmdbMovieId())
                .movieTitle(item.getMovieTitle())
                .posterPath(item.getPosterPath())
                .addedAt(item.getAddedAt())
                .build();
    }
}
