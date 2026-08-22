package com.example.demo.domain.playlist.repository;

import com.example.demo.domain.playlist.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByIsPublicTrueOrderByCreatedAtDesc();
    List<Playlist> findByUserIdentifierOrderByCreatedAtDesc(String userIdentifier);

    @Query("SELECT DISTINCT p FROM Playlist p JOIN p.items i WHERE i.tmdbMovieId = :tmdbMovieId AND p.isPublic = true ORDER BY p.createdAt DESC")
    List<Playlist> findPublicPlaylistsContainingMovie(@Param("tmdbMovieId") Long tmdbMovieId);
}
