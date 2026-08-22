package com.example.demo.domain.playlist.controller;

import com.example.demo.domain.playlist.dto.*;
import com.example.demo.domain.playlist.service.PlaylistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Playlist API", description = "나만의 커스텀 영화 플레이리스트 생성, 조회, 영화 추가 및 삭제 API")
@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @Operation(summary = "신규 영화 플레이리스트 생성", description = "제목과 설명, 공개 여부를 지정하여 나만의 시네마 컬렉션을 생성합니다.")
    @PostMapping
    public ResponseEntity<PlaylistResponse> createPlaylist(@Valid @RequestBody PlaylistCreateRequest request) {
        PlaylistResponse response = playlistService.createPlaylist(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "공개 플레이리스트 전체 목록 조회", description = "모든 사용자가 공개로 설정한 시네마 컬렉션 목록을 최신순으로 조회합니다.")
    @GetMapping("/public")
    public ResponseEntity<List<PlaylistResponse>> getPublicPlaylists() {
        List<PlaylistResponse> response = playlistService.getPublicPlaylists();
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "특정 영화가 포함된 공개 컬렉션 목록 조회", description = "해당 TMDB 영화가 수록된 공개 플레이리스트(컬렉션)들을 조회합니다.")
    @GetMapping("/containing-movie/{movieId}")
    public ResponseEntity<List<PlaylistResponse>> getPlaylistsContainingMovie(@PathVariable Long movieId) {
        List<PlaylistResponse> response = playlistService.getPublicPlaylistsContainingMovie(movieId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "특정 사용자의 플레이리스트 목록 조회", description = "사용자 식별자(닉네임/게스트ID)로 작성한 플레이리스트들을 조회합니다.")
    @GetMapping("/user")
    public ResponseEntity<List<PlaylistResponse>> getUserPlaylists(@RequestParam String userIdentifier) {
        List<PlaylistResponse> response = playlistService.getUserPlaylists(userIdentifier);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "플레이리스트 단건 상세 조회", description = "플레이리스트 ID로 수록된 영화 목록과 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<PlaylistResponse> getPlaylist(@PathVariable Long id) {
        PlaylistResponse response = playlistService.getPlaylist(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "플레이리스트에 영화 추가", description = "특정 플레이리스트에 TMDB 영화를 수록합니다.")
    @PostMapping("/{id}/movies")
    public ResponseEntity<PlaylistResponse> addMovieToPlaylist(
            @PathVariable Long id,
            @Valid @RequestBody PlaylistItemAddRequest request) {
        PlaylistResponse response = playlistService.addMovieToPlaylist(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "플레이리스트에서 영화 삭제", description = "플레이리스트에서 특정 영화를 제외시킵니다.")
    @DeleteMapping("/{id}/movies/{movieId}")
    public ResponseEntity<PlaylistResponse> removeMovieFromPlaylist(
            @PathVariable Long id,
            @PathVariable Long movieId) {
        PlaylistResponse response = playlistService.removeMovieFromPlaylist(id, movieId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "플레이리스트 전체 삭제", description = "플레이리스트를 완전히 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(
            @PathVariable Long id,
            @RequestParam String userIdentifier) {
        playlistService.deletePlaylist(id, userIdentifier);
        return ResponseEntity.noContent().build();
    }
}
