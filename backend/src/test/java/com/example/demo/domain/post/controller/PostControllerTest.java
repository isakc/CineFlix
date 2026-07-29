package com.example.demo.domain.post.controller;

import com.example.demo.domain.post.dto.PostCreateRequest;
import com.example.demo.domain.post.dto.PostUpdateRequest;
import com.example.demo.domain.post.repository.PostRepository;
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
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PostRepository postRepository;

    @BeforeEach
    void setUp() {
        postRepository.deleteAll();
    }

    @Test
    @DisplayName("게시글 생성 API 테스트")
    void createPostTest() throws Exception {
        PostCreateRequest request = PostCreateRequest.builder()
                .title("테스트 제목")
                .content("테스트 내용입니다.")
                .author("홍길동")
                .build();

        mockMvc.perform(post( "/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$").isNumber());
    }

    @Test
    @DisplayName("게시글 단건 조회 API 테스트")
    void getPostTest() throws Exception {
        PostCreateRequest createRequest = PostCreateRequest.builder()
                .title("샘플 제목")
                .content("샘플 본문")
                .author("이순신")
                .build();

        String responseString = mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long id = Long.parseLong(responseString);

        mockMvc.perform(get("/api/posts/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("샘플 제목")))
                .andExpect(jsonPath("$.content", is("샘플 본문")))
                .andExpect(jsonPath("$.author", is("이순신")));
    }

    @Test
    @DisplayName("게시글 수정 API 테스트")
    void updatePostTest() throws Exception {
        PostCreateRequest createRequest = PostCreateRequest.builder()
                .title("원래 제목")
                .content("원래 내용")
                .author("강감찬")
                .build();

        String responseString = mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long id = Long.parseLong(responseString);

        PostUpdateRequest updateRequest = PostUpdateRequest.builder()
                .title("수정된 제목")
                .content("수정된 내용")
                .build();

        mockMvc.perform(put("/api/posts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/posts/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("수정된 제목")))
                .andExpect(jsonPath("$.content", is("수정된 내용")));
    }
}
