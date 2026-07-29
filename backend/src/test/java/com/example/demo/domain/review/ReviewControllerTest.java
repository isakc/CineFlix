package com.example.demo.domain.review;

import com.example.demo.domain.review.dto.ReviewCreateRequest;
import com.example.demo.domain.review.dto.ReviewUpdateRequest;
import com.example.demo.domain.review.repository.ReviewRepository;
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
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReviewRepository reviewRepository;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
    }

    @Test
    @DisplayName("리뷰 작성 및 영화별 리뷰 목록 조회 테스트")
    void createAndGetReviewsTest() throws Exception {
        ReviewCreateRequest request = ReviewCreateRequest.builder()
                .tmdbMovieId(550L)
                .author("영화매니아")
                .rating(5.0)
                .content("정말 대단한 명작입니다!")
                .build();

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$").isNumber());

        mockMvc.perform(get("/api/movies/550/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].author", is("영화매니아")))
                .andExpect(jsonPath("$.content[0].rating", is(5.0)))
                .andExpect(jsonPath("$.content[0].content", is("정말 대단한 명작입니다!")));
    }

    @Test
    @DisplayName("영화별 평균 별점 및 리뷰 수 요약 조회 테스트")
    void getMovieRatingSummaryTest() throws Exception {
        ReviewCreateRequest r1 = ReviewCreateRequest.builder().tmdbMovieId(550L).author("u1").rating(5.0).content("Good").build();
        ReviewCreateRequest r2 = ReviewCreateRequest.builder().tmdbMovieId(550L).author("u2").rating(3.0).content("So so").build();

        mockMvc.perform(post("/api/reviews").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(r1)));
        mockMvc.perform(post("/api/reviews").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(r2)));

        mockMvc.perform(get("/api/movies/550/rating-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tmdbMovieId", is(550)))
                .andExpect(jsonPath("$.averageRating", is(4.0)))
                .andExpect(jsonPath("$.totalReviewCount", is(2)));
    }
}
