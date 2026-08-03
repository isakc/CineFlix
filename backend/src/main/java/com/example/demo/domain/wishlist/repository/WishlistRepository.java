package com.example.demo.domain.wishlist.repository;

import com.example.demo.domain.wishlist.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    Page<Wishlist> findByUserIdentifier(String userIdentifier, Pageable pageable);

    List<Wishlist> findByUserIdentifier(String userIdentifier);

    boolean existsByUserIdentifierAndTmdbMovieId(String userIdentifier, Long tmdbMovieId);

    Optional<Wishlist> findByUserIdentifierAndTmdbMovieId(String userIdentifier, Long tmdbMovieId);
}
