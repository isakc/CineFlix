package com.example.demo.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationResponse {

    private boolean success;
    private String message;
    private String devCode;
    private int expireSeconds;
}
