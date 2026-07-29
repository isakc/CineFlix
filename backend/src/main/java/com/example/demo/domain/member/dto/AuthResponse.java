package com.example.demo.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {

    private final String accessToken;
    private final String tokenType = "Bearer";
    private final String email;
    private final String nickname;
}
