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

    @Operation(summary = "프로필(닉네임) 변경", description = "현재 로그인한 사용자의 닉네임을 변경합니다.")
    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AuthResponse response = authService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "비밀번호 변경", description = "현재 로그인한 사용자의 비밀번호를 변경합니다.")
    @PutMapping("/password")
    public ResponseEntity<Void> updatePassword(
            Authentication authentication,
            @Valid @RequestBody UpdatePasswordRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.updatePassword(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "OAuth 환경변수 설정 상태 확인 (디버깅용)", description = "OAuth 환경변수 로드 상태를 마스킹하여 반환합니다.")
    @GetMapping("/oauth-status")
    public ResponseEntity<java.util.Map<String, Object>> oauthStatus() {
        java.util.Map<String, Object> map = new java.util.LinkedHashMap<>();

        String gId = getResolvedEnv("GOOGLE_CLIENT_ID");
        String gSecret = getResolvedEnv("GOOGLE_CLIENT_SECRET");
        String nId = getResolvedEnv("NAVER_CLIENT_ID");
        String nSecret = getResolvedEnv("NAVER_CLIENT_SECRET");
        String redirectUri = getResolvedEnv("FRONTEND_OAUTH2_REDIRECT_URI");

        map.put("status", "UP");
        map.put("buildVersion", "2026-09-10-post-method");

        map.put("googleClientId", maskValue(gId));
        map.put("googleClientIdLength", gId != null ? gId.length() : 0);

        java.util.Map<String, Object> gSecretMap = new java.util.LinkedHashMap<>();
        gSecretMap.put("configured", gSecret != null && !gSecret.isBlank());
        gSecretMap.put("isDummy", "dummy-google-client-secret".equals(gSecret));
        gSecretMap.put("length", gSecret != null ? gSecret.length() : 0);
        gSecretMap.put("prefix", gSecret != null && gSecret.length() >= 7 ? gSecret.substring(0, 7) : "N/A");
        gSecretMap.put("suffix", gSecret != null && gSecret.length() >= 4 ? gSecret.substring(gSecret.length() - 4) : "N/A");
        map.put("googleClientSecret", gSecretMap);

        map.put("naverClientId", maskValue(nId));
        map.put("naverClientIdLength", nId != null ? nId.length() : 0);

        java.util.Map<String, Object> nSecretMap = new java.util.LinkedHashMap<>();
        nSecretMap.put("configured", nSecret != null && !nSecret.isBlank());
        nSecretMap.put("isDummy", "dummy-naver-client-secret".equals(nSecret));
        nSecretMap.put("length", nSecret != null ? nSecret.length() : 0);
        nSecretMap.put("prefix", nSecret != null && nSecret.length() >= 2 ? nSecret.substring(0, 2) : "N/A");
        nSecretMap.put("suffix", nSecret != null && nSecret.length() >= 2 ? nSecret.substring(nSecret.length() - 2) : "N/A");
        map.put("naverClientSecret", nSecretMap);

        map.put("frontendOAuth2RedirectUri", redirectUri);

        return ResponseEntity.ok(map);
    }

    private String getResolvedEnv(String key) {
        String val = System.getProperty(key);
        if (val == null || val.isBlank()) {
            val = System.getenv(key);
        }
        return val;
    }

    private String maskValue(String val) {
        if (val == null || val.isBlank()) return "null";
        if (val.length() <= 8) return val.substring(0, 2) + "***";
        return val.substring(0, 6) + "..." + val.substring(val.length() - 4);
    }
}
