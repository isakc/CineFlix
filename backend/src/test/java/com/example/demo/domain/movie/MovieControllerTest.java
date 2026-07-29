package com.example.demo.domain.movie;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("인기 영화 목록 조회 API 테스트")
    void getPopularMoviesTest() throws Exception {
        mockMvc.perform(get("/api/movies/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results.length()", greaterThan(0)));
    }

    @Test
    @DisplayName("영화 검색 API 테스트")
    void searchMoviesTest() throws Exception {
        mockMvc.perform(get("/api/movies/search")
                        .param("query", "인셉션"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results.length()", greaterThan(0)));
    }

    @Test
    @DisplayName("영화 상세 정보 조회 API 테스트")
    void getMovieDetailsTest() throws Exception {
        mockMvc.perform(get("/api/movies/550"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(550));
    }
}
