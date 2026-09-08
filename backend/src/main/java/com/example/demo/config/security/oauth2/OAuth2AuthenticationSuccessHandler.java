package com.example.demo.config.security.oauth2;

import com.example.demo.config.security.JwtTokenProvider;
import com.example.demo.domain.member.entity.Member;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2UserPrincipal principal = (OAuth2UserPrincipal) authentication.getPrincipal();
        Member member = principal.getMember();

        String token = jwtTokenProvider.createToken(
                member.getEmail(),
                member.getNickname(),
                member.getRole().name()
        );

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .queryParam("email", URLEncoder.encode(member.getEmail(), StandardCharsets.UTF_8))
                .queryParam("nickname", URLEncoder.encode(member.getNickname(), StandardCharsets.UTF_8))
                .build().toUriString();

        log.info("소셜 로그인 성공! 리다이렉트: email={}, targetUrl={}", member.getEmail(), redirectUri);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
