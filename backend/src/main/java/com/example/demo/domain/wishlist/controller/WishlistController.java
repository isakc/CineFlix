package com.example.demo.domain.wishlist.controller;

import com.example.demo.domain.wishlist.dto.WishlistAddRequest;
import com.example.demo.domain.wishlist.dto.WishlistResponse;
import com.example.demo.domain.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping
    public ResponseEntity<Long> addToWishlist(@Valid @RequestBody WishlistAddRequest request) {
        Long wishlistId = wishlistService.addToWishlist(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(wishlistId);
    }

    @GetMapping
    public ResponseEntity<Page<WishlistResponse>> getUserWishlist(
            @RequestParam String userIdentifier,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<WishlistResponse> wishlist = wishlistService.getUserWishlist(userIdentifier, pageable);
        return ResponseEntity.ok(wishlist);
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> isWishlisted(
            @RequestParam String userIdentifier,
            @RequestParam Long movieId) {
        boolean exists = wishlistService.isWishlisted(userIdentifier, movieId);
        return ResponseEntity.ok(exists);
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFromWishlist(
            @RequestParam String userIdentifier,
            @RequestParam Long movieId) {
        wishlistService.removeFromWishlist(userIdentifier, movieId);
        return ResponseEntity.noContent().build();
    }
}
