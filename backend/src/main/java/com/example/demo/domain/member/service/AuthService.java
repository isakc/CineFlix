package com.example.demo.domain.member.service;

import com.example.demo.config.security.JwtTokenProvider;
import com.example.demo.domain.member.dto.AuthResponse;
import com.example.demo.domain.member.dto.LoginRequest;
import com.example.demo.domain.member.dto.SignupRequest;
import com.example.demo.domain.member.entity.Member;
import com.example.demo.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        if (!emailVerificationService.isEmailVerified(request.getEmail())) {
            throw new IllegalArgumentException("이메일 인증이 완료되지 않았습니다. 인증번호를 확인해 주세요.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Member member = memberRepository.save(request.toEntity(encodedPassword));

        emailVerificationService.clearVerification(request.getEmail());

        String token = jwtTokenProvider.createToken(member.getEmail(), member.getNickname(), member.getRole().name());

        return AuthResponse.builder()
                .accessToken(token)
                .email(member.getEmail())
                .nickname(member.getNickname())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 잘못되었습니다."));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 잘못되었습니다.");
        }

        String token = jwtTokenProvider.createToken(member.getEmail(), member.getNickname(), member.getRole().name());

        return AuthResponse.builder()
                .accessToken(token)
                .email(member.getEmail())
                .nickname(member.getNickname())
                .build();
    }

    public AuthResponse me(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

        return AuthResponse.builder()
                .accessToken(null)
                .email(member.getEmail())
                .nickname(member.getNickname())
                .build();
    }
}
