package com.example.demo.domain.wishlist.dto;

import com.example.demo.domain.wishlist.entity.Wishlist;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class WishlistResponse {

    private final Long id;
    private final String userIdentifier;
    private final Long tmdbMovieId;
    private final String movieTitle;
    private final String posterPath;
    private final LocalDateTime createdAt;

    public WishlistResponse(Wishlist wishlist) {
        this.id = wishlist.getId();
        this.userIdentifier = wishlist.getUserIdentifier();
        this.tmdbMovieId = wishlist.getTmdbMovieId();
        this.movieTitle = wishlist.getMovieTitle();
        this.posterPath = wishlist.getPosterPath();
        this.createdAt = wishlist.getCreatedAt();
    }
}
