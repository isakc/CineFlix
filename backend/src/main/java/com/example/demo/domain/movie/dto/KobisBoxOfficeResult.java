package com.example.demo.domain.movie.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class KobisBoxOfficeResult {
    private String boxofficeType;
    private String showRange;
    private List<KobisDailyBoxOfficeDto> dailyBoxOfficeList;
}
