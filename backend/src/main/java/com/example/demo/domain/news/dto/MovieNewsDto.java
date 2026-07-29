package com.example.demo.domain.news.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieNewsDto {
    private String title;
    private String link;
    private String description;
    private String press;
    private String pubDate;
}
