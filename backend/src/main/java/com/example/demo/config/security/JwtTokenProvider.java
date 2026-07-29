package com.example.demo.config.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:cineflix_secret_jwt_key_super_secure_random_string_2026_demo_project_key}")
    private String secretKeyString;

    @Value("${jwt.expiration-ms:86400000}")
    private long validityInMilliseconds;

    private SecretKey secretKey;

    @PostConstruct
    protected void init() {
        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(String email, String nickname, String role) {
        Claims claims = Jwts.claims()
                .subject(email)
                .add("nickname", nickname)
                .add("role", role)
                .build();

        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);
        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        User principal = new User(email, "", List.of(new SimpleGrantedAuthority(role)));
        return new UsernamePasswordAuthenticationToken(principal, token, principal.getAuthorities());
    }

    public String getEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String getNickname(String token) {
        return parseClaims(token).get("nickname", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid or expired JWT token: {}", e.getMessage());
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
