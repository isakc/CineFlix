package com.example.demo.domain.post.dto;

import com.example.demo.domain.post.entity.Post;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PostCreateRequest {

    @NotBlank(message = "제목은 필수 입력값입니다.")
    @Size(max = 100, message = "제목은 100자 이하이어야 합니다.")
    private String title;

    @NotBlank(message = "내용은 필수 입력값입니다.")
    private String content;

    @NotBlank(message = "작성자는 필수 입력값입니다.")
    @Size(max = 50, message = "작성자 이름은 50자 이하이어야 합니다.")
    private String author;

    @Builder
    public PostCreateRequest(String title, String content, String author) {
        this.title = title;
        this.content = content;
        this.author = author;
    }

    public Post toEntity() {
        return Post.builder()
                .title(title)
                .content(content)
                .author(author)
                .build();
    }
}
