package com.example.demo.domain.member.controller;

import com.example.demo.domain.member.dto.*;
import com.example.demo.domain.member.service.AuthService;
import com.example.demo.domain.member.service.EmailVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth API", description = "회원가입, 로그인, 이메일 인증 및 내 정보 조회 인증 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    @Operation(summary = "이메일 인증번호 발송", description = "회원가입을 위한 6자리 인증번호를 이메일로 발송합니다.")
    @PostMapping("/send-verification-code")
    public ResponseEntity<EmailVerificationResponse> sendVerificationCode(@Valid @RequestBody EmailSendRequest request) {
        EmailVerificationResponse response = emailVerificationService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "이메일 인증번호 검증", description = "발송된 6자리 인증번호를 검증합니다.")
    @PostMapping("/verify-code")
    public ResponseEntity<EmailVerificationResponse> verifyCode(@Valid @RequestBody EmailVerifyRequest request) {
        EmailVerificationResponse response = emailVerificationService.verifyCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원가입", description = "이메일, 비밀번호, 닉네임으로 신규 회원가입을 진행합니다.")
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "내 회원 정보 조회", description = "JWT 토큰 인증 기반으로 현재 로그인한 사용자의 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AuthResponse response = authService.me(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
