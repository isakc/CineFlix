package com.example.demo.domain.playlist.repository;

import com.example.demo.domain.playlist.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByIsPublicTrueOrderByCreatedAtDesc();
    List<Playlist> findByUserIdentifierOrderByCreatedAtDesc(String userIdentifier);
}
