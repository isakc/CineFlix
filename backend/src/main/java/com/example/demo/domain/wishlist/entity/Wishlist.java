package com.example.demo.domain.wishlist.entity;

import com.example.demo.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wishlists", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_movie", columnNames = {"userIdentifier", "tmdbMovieId"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Wishlist extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String userIdentifier;

    @Column(nullable = false)
    private Long tmdbMovieId;

    @Column(nullable = false, length = 200)
    private String movieTitle;

    @Column(length = 300)
    private String posterPath;

    @Builder
    public Wishlist(String userIdentifier, Long tmdbMovieId, String movieTitle, String posterPath) {
        this.userIdentifier = userIdentifier;
        this.tmdbMovieId = tmdbMovieId;
        this.movieTitle = movieTitle;
        this.posterPath = posterPath;
    }
}
