package com.example.demo.config.security.oauth2;

import com.example.demo.domain.member.entity.AuthProvider;
import com.example.demo.domain.member.entity.Member;
import com.example.demo.domain.member.entity.Role;
import com.example.demo.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        if (userInfo.getEmail() == null || userInfo.getEmail().isBlank()) {
            throw new OAuth2AuthenticationException("소셜 로그인 제공자로부터 이메일을 제공받을 수 없습니다.");
        }

        Member member = processOAuth2User(registrationId, userInfo);
        return new OAuth2UserPrincipal(member, oAuth2User.getAttributes());
    }

    private Member processOAuth2User(String registrationId, OAuth2UserInfo userInfo) {
        AuthProvider provider;
        try {
            provider = AuthProvider.valueOf(registrationId.toUpperCase());
        } catch (IllegalArgumentException e) {
            provider = AuthProvider.LOCAL;
        }

        Optional<Member> memberOptional = memberRepository.findByEmail(userInfo.getEmail());
        Member member;

        if (memberOptional.isPresent()) {
            member = memberOptional.get();
            member.updateSocialInfo(null, userInfo.getId());
            log.info("기존 회원 소셜 로그인: email={}, provider={}", member.getEmail(), provider);
        } else {
            String initialNickname = userInfo.getName();
            if (initialNickname == null || initialNickname.isBlank()) {
                initialNickname = registrationId.substring(0, 1).toUpperCase() + registrationId.substring(1) + "유저";
            }
            if (initialNickname.length() > 40) {
                initialNickname = initialNickname.substring(0, 40);
            }

            // If nickname already exists, append random suffix
            String candidateNickname = initialNickname;
            int counter = 1;
            while (memberRepository.findByEmail(candidateNickname).isPresent()) { // or check nickname if unique
                candidateNickname = initialNickname + "_" + counter++;
            }

            member = Member.builder()
                    .email(userInfo.getEmail())
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .nickname(candidateNickname)
                    .role(Role.ROLE_USER)
                    .provider(provider)
                    .providerId(userInfo.getId())
                    .build();

            member = memberRepository.save(member);
            log.info("신규 회원 소셜 가입 완료: email={}, nickname={}, provider={}", member.getEmail(), member.getNickname(), provider);
        }

        return member;
    }
}
