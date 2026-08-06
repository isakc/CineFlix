package com.example.demo.domain.playlist.repository;

import com.example.demo.domain.playlist.entity.PlaylistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlaylistItemRepository extends JpaRepository<PlaylistItem, Long> {
    Optional<PlaylistItem> findByPlaylistIdAndTmdbMovieId(Long playlistId, Long tmdbMovieId);
}
