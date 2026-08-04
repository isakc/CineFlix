package com.example.demo.domain.wishlist.controller;

import com.example.demo.domain.wishlist.dto.WishlistAddRequest;
import com.example.demo.domain.wishlist.dto.WishlistResponse;
import com.example.demo.domain.wishlist.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Wishlist API", description = "영화 위시리스트 추가, 조회, 삭제 및 배치 처리 API")
@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @Operation(summary = "위시리스트 담기", description = "사용자가 선택한 영화를 위시리스트에 추가합니다.")
    @PostMapping
    public ResponseEntity<Long> addToWishlist(@Valid @RequestBody WishlistAddRequest request) {
        Long wishlistId = wishlistService.addToWishlist(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(wishlistId);
    }

    @Operation(summary = "위시리스트 일괄 추가 (Batch)", description = "온보딩 또는 다중 선택 시 여러 영화를 일괄 추가합니다.")
    @PostMapping("/batch")
    public ResponseEntity<Integer> addBatchToWishlist(@RequestBody List<WishlistAddRequest> requests) {
        int count = wishlistService.addBatchToWishlist(requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(count);
    }

    @Operation(summary = "사용자 위시리스트 목록 조회", description = "사용자의 위시리스트 저장 영화 목록을 페이징 처리하여 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<WishlistResponse>> getUserWishlist(
            @RequestParam String userIdentifier,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<WishlistResponse> wishlist = wishlistService.getUserWishlist(userIdentifier, pageable);
        return ResponseEntity.ok(wishlist);
    }

    @Operation(summary = "위시리스트 등록 여부 확인", description = "특정 영화가 사용자의 위시리스트에 담겨있는지 확인합니다.")
    @GetMapping("/check")
    public ResponseEntity<Boolean> isWishlisted(
            @RequestParam String userIdentifier,
            @RequestParam Long movieId) {
        boolean exists = wishlistService.isWishlisted(userIdentifier, movieId);
        return ResponseEntity.ok(exists);
    }

    @Operation(summary = "위시리스트 영화 삭제", description = "특정 영화를 사용자의 위시리스트에서 삭제합니다.")
    @DeleteMapping
    public ResponseEntity<Void> removeFromWishlist(
            @RequestParam String userIdentifier,
            @RequestParam Long movieId) {
        wishlistService.removeFromWishlist(userIdentifier, movieId);
        return ResponseEntity.noContent().build();
    }
}
