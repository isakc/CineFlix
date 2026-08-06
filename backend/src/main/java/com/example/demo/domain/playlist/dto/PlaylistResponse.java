package com.example.demo.domain.playlist.dto;

import com.example.demo.domain.playlist.entity.Playlist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistResponse {
    private Long id;
    private String title;
    private String description;
    private String userIdentifier;
    private boolean isPublic;
    private List<PlaylistItemResponse> items;
    private int itemCount;
    private LocalDateTime createdAt;

    public static PlaylistResponse from(Playlist playlist) {
        List<PlaylistItemResponse> itemResponses = playlist.getItems() == null
                ? List.of()
                : playlist.getItems().stream().map(PlaylistItemResponse::from).toList();

        return PlaylistResponse.builder()
                .id(playlist.getId())
                .title(playlist.getTitle())
                .description(playlist.getDescription())
                .userIdentifier(playlist.getUserIdentifier())
                .isPublic(playlist.isPublic())
                .items(itemResponses)
                .itemCount(itemResponses.size())
                .createdAt(playlist.getCreatedAt())
                .build();
    }
}
