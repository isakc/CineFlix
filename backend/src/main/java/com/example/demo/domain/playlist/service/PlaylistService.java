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

    @Transactional
    public List<PlaylistResponse> getPublicPlaylists() {
        if (playlistRepository.count() == 0) {
            initSamplePlaylists();
        }
        return playlistRepository.findByIsPublicTrueOrderByCreatedAtDesc().stream()
                .map(PlaylistResponse::from)
                .toList();
    }

    public List<PlaylistResponse> getPublicPlaylistsContainingMovie(Long tmdbMovieId) {
        if (playlistRepository.count() == 0) {
            initSamplePlaylists();
        }
        return playlistRepository.findPublicPlaylistsContainingMovie(tmdbMovieId).stream()
                .map(PlaylistResponse::from)
                .toList();
    }

    private void initSamplePlaylists() {
        try {
            // Collection 1: Christopher Nolan
            Playlist p1 = Playlist.builder()
                    .userIdentifier("CineFlix 큐레이터")
                    .title("🎬 크리스토퍼 놀란 감독 명작 컬렉션")
                    .description("경이로운 영상미와 치밀한 플롯으로 전 세계를 사로잡은 놀란 감독의 대표작 모음")
                    .isPublic(true)
                    .build();
            p1 = playlistRepository.save(p1);
            addSampleItem(p1, 872585L, "오펜하이머", "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg");
            addSampleItem(p1, 157336L, "인터스텔라", "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg");
            addSampleItem(p1, 27205L, "인셉션", "/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg");
            addSampleItem(p1, 155L, "다크 나이트", "/qJ2tW6WMUDux911r6m7haRef0WH.jpg");

            // Collection 2: Sci-Fi Universe
            Playlist p2 = Playlist.builder()
                    .userIdentifier("SF매니아")
                    .title("🚀 우주 & SF 마니아 필수 시청 컬렉션")
                    .description("미지의 우주와 압도적인 상상력으로 가득 찬 최고의 SF 명작 컬렉션")
                    .isPublic(true)
                    .build();
            p2 = playlistRepository.save(p2);
            addSampleItem(p2, 157336L, "인터스텔라", "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg");
            addSampleItem(p2, 693134L, "듄: 파트 2", "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg");
            addSampleItem(p2, 945961L, "에이리언: 로물루스", "/b33nnKl1v074FdZRRR0i1Z4q2jB.jpg");
            addSampleItem(p2, 49047L, "그래비티", "/bO2m5dE76g9uO8fHdr5r9zR6P6u.jpg");

            // Collection 3: Popcorn Action
            Playlist p3 = Playlist.builder()
                    .userIdentifier("액션매니아")
                    .title("🍿 팝콘각 200%! 아드레날린 폭발 액션 컬렉션")
                    .description("숨 쉴 틈 없이 휘몰아치는 타격감과 스릴 넘치는 블록버스터 액션 모음")
                    .isPublic(true)
                    .build();
            p3 = playlistRepository.save(p3);
            addSampleItem(p3, 603692L, "존 윅 4", "/vZloFAK7NDTugKEY7DCihxYQ522.jpg");
            addSampleItem(p3, 575264L, "미션 임파서블: 데드 레코닝", "/7I6VUdPj6tQECNHdviJkUHD2389.jpg");
            addSampleItem(p3, 385687L, "분노의 질주: 라이드 오어 다이", "/fiVW06jE7z9YBo4Tr4AIyXv4h5R.jpg");
            addSampleItem(p3, 550L, "파이트 클럽", "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg");

            // Collection 4: Emotional Healing
            Playlist p4 = Playlist.builder()
                    .userIdentifier("감성시네마")
                    .title("💖 가슴 몽글몽글 따뜻해지는 감성 힐링 영화")
                    .description("지친 하루 끝에 따뜻한 위로와 벅찬 감동을 선물하는 힐링 영화 명작선")
                    .isPublic(true)
                    .build();
            p4 = playlistRepository.save(p4);
            addSampleItem(p4, 976573L, "엘리멘탈", "/8riWfqAzUQifpGz1e7yvTzJ0WvP.jpg");
            addSampleItem(p4, 1022789L, "인사이드 아웃 2", "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg");
            addSampleItem(p4, 313369L, "라라랜드", "/uDO8zWDhfWwoFdKS4fzkVJt0Rf0.jpg");
            addSampleItem(p4, 122906L, "어바웃 타임", "/iR1bVfPQHzWeubGzNL59w4p480.jpg");
        } catch (Exception e) {
            // ignore
        }
    }

    private void addSampleItem(Playlist playlist, Long movieId, String title, String posterPath) {
        PlaylistItem item = PlaylistItem.builder()
                .playlist(playlist)
                .tmdbMovieId(movieId)
                .movieTitle(title)
                .posterPath(posterPath)
                .build();
        playlistItemRepository.save(item);
        playlist.getItems().add(item);
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
