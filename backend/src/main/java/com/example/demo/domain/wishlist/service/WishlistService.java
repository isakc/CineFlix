package com.example.demo.domain.wishlist.service;

import com.example.demo.domain.wishlist.dto.WishlistAddRequest;
import com.example.demo.domain.wishlist.dto.WishlistResponse;
import com.example.demo.domain.wishlist.entity.Wishlist;
import com.example.demo.domain.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    @Transactional
    public Long addToWishlist(WishlistAddRequest request) {
        if (wishlistRepository.existsByUserIdentifierAndTmdbMovieId(request.getUserIdentifier(), request.getTmdbMovieId())) {
            throw new IllegalArgumentException("이미 위시리스트에 추가된 영화입니다.");
        }
        Wishlist wishlist = request.toEntity();
        return wishlistRepository.save(wishlist).getId();
    }

    @Transactional
    public int addBatchToWishlist(List<WishlistAddRequest> requests) {
        int addedCount = 0;
        for (WishlistAddRequest req : requests) {
            if (!wishlistRepository.existsByUserIdentifierAndTmdbMovieId(req.getUserIdentifier(), req.getTmdbMovieId())) {
                wishlistRepository.save(req.toEntity());
                addedCount++;
            }
        }
        return addedCount;
    }

    public Page<WishlistResponse> getUserWishlist(String userIdentifier, Pageable pageable) {
        return wishlistRepository.findByUserIdentifier(userIdentifier, pageable)
                .map(WishlistResponse::new);
    }

    public boolean isWishlisted(String userIdentifier, Long tmdbMovieId) {
        return wishlistRepository.existsByUserIdentifierAndTmdbMovieId(userIdentifier, tmdbMovieId);
    }

    @Transactional
    public void removeFromWishlist(String userIdentifier, Long tmdbMovieId) {
        Wishlist wishlist = wishlistRepository.findByUserIdentifierAndTmdbMovieId(userIdentifier, tmdbMovieId)
                .orElseThrow(() -> new IllegalArgumentException("위시리스트 항목을 찾을 수 없습니다."));
        wishlistRepository.delete(wishlist);
    }

    @Transactional
    public void deleteById(Long id) {
        wishlistRepository.findById(id).ifPresent(wishlistRepository::delete);
    }
}
