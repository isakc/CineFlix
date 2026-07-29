package com.example.demo.domain.wishlist.dto;

import com.example.demo.domain.wishlist.entity.Wishlist;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistAddRequest {

    @NotBlank(message = "사용자 식별자는 필수입니다.")
    private String userIdentifier;

    @NotNull(message = "영화 ID는 필수입니다.")
    private Long tmdbMovieId;

    @NotBlank(message = "영화 제목은 필수입니다.")
    private String movieTitle;

    private String posterPath;

    public Wishlist toEntity() {
        return Wishlist.builder()
                .userIdentifier(userIdentifier)
                .tmdbMovieId(tmdbMovieId)
                .movieTitle(movieTitle)
                .posterPath(posterPath)
                .build();
    }
}
