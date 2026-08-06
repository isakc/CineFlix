package com.example.demo.domain.playlist.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "playlists")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String userIdentifier;

    @Column(name = "is_public", nullable = false)
    @JsonProperty("isPublic")
    @Builder.Default
    private boolean isPublic = true;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PlaylistItem> items = new ArrayList<>();

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @JsonProperty("isPublic")
    public boolean isPublic() {
        return isPublic;
    }

    @JsonProperty("isPublic")
    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
}
