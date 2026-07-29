package com.example.demo.domain.wishlist;

import com.example.demo.domain.wishlist.dto.WishlistAddRequest;
import com.example.demo.domain.wishlist.repository.WishlistRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class WishlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WishlistRepository wishlistRepository;

    @BeforeEach
    void setUp() {
        wishlistRepository.deleteAll();
    }

    @Test
    @DisplayName("위시리스트 추가 및 목록/체크/삭제 테스트")
    void wishlistLifecycleTest() throws Exception {
        WishlistAddRequest request = WishlistAddRequest.builder()
                .userIdentifier("user123")
                .tmdbMovieId(550L)
                .movieTitle("파이트 클럽")
                .posterPath("/poster.jpg")
                .build();

        // 1. 위시리스트 추가
        mockMvc.perform(post("/api/wishlists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // 2. 위시리스트 여부 확인
        mockMvc.perform(get("/api/wishlists/check")
                        .param("userIdentifier", "user123")
                        .param("movieId", "550"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));

        // 3. 사용자 위시리스트 목록 조회
        mockMvc.perform(get("/api/wishlists")
                        .param("userIdentifier", "user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].movieTitle", is("파이트 클럽")));

        // 4. 위시리스트 삭제
        mockMvc.perform(delete("/api/wishlists")
                        .param("userIdentifier", "user123")
                        .param("movieId", "550"))
                .andExpect(status().isNoContent());

        // 5. 삭제 확인
        mockMvc.perform(get("/api/wishlists/check")
                        .param("userIdentifier", "user123")
                        .param("movieId", "550"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }
}
