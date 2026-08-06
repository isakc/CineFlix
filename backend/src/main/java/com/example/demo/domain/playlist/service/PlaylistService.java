package com.example.demo.domain.playlist.service;

import com.example.demo.domain.playlist.dto.*;
import com.example.demo.domain.playlist.entity.Playlist;
import com.example.demo.domain.playlist.entity.PlaylistItem;
import com.example.demo.domain.playlist.repository.PlaylistItemRepository;
import com.example.demo.domain.playlist.repository.PlaylistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistItemRepository playlistItemRepository;

    @Transactional
    public PlaylistResponse createPlaylist(PlaylistCreateRequest request) {
        Playlist playlist = Playlist.builder()
                .userIdentifier(request.getUserIdentifier())
                .title(request.getTitle())
                .description(request.getDescription())
                .isPublic(request.isPublic())
                .build();

        Playlist saved = playlistRepository.save(playlist);
        return PlaylistResponse.from(saved);
    }

    public List<PlaylistResponse> getPublicPlaylists() {
        return playlistRepository.findByIsPublicTrueOrderByCreatedAtDesc().stream()
                .map(PlaylistResponse::from)
                .toList();
    }

    public List<PlaylistResponse> getUserPlaylists(String userIdentifier) {
        return playlistRepository.findByUserIdentifierOrderByCreatedAtDesc(userIdentifier).stream()
                .map(PlaylistResponse::from)
                .toList();
    }

    public PlaylistResponse getPlaylist(Long playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with ID: " + playlistId));
        return PlaylistResponse.from(playlist);
    }

    @Transactional
    public PlaylistResponse addMovieToPlaylist(Long playlistId, PlaylistItemAddRequest request) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with ID: " + playlistId));

        boolean exists = playlistItemRepository.findByPlaylistIdAndTmdbMovieId(playlistId, request.getTmdbMovieId()).isPresent();
        if (exists) {
            return PlaylistResponse.from(playlist);
        }

        PlaylistItem item = PlaylistItem.builder()
                .playlist(playlist)
                .tmdbMovieId(request.getTmdbMovieId())
                .movieTitle(request.getMovieTitle())
                .posterPath(request.getPosterPath())
                .build();

        playlistItemRepository.save(item);
        playlist.getItems().add(item);
        return PlaylistResponse.from(playlist);
    }

    @Transactional
    public PlaylistResponse removeMovieFromPlaylist(Long playlistId, Long tmdbMovieId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with ID: " + playlistId));

        playlistItemRepository.findByPlaylistIdAndTmdbMovieId(playlistId, tmdbMovieId)
                .ifPresent(item -> {
                    playlist.getItems().remove(item);
                    playlistItemRepository.delete(item);
                });

        return PlaylistResponse.from(playlist);
    }

    @Transactional
    public void deletePlaylist(Long playlistId, String userIdentifier) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found with ID: " + playlistId));

        if (!playlist.getUserIdentifier().equals(userIdentifier)) {
            throw new IllegalStateException("Only playlist owner can delete it.");
        }

        playlistRepository.delete(playlist);
    }
}
