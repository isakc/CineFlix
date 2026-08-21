package com.example.demo.domain.member.service;

import com.example.demo.domain.member.dto.EmailVerificationResponse;
import com.example.demo.domain.member.repository.MemberRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final MemberRepository memberRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    private final Map<String, VerificationState> verificationStore = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    @Getter
    private static class VerificationState {
        private final String code;
        private final LocalDateTime expireAt;
        private boolean verified;

        public VerificationState(String code, LocalDateTime expireAt) {
            this.code = code;
            this.expireAt = expireAt;
            this.verified = false;
        }

        public void markVerified() {
            this.verified = true;
        }
    }

    public EmailVerificationResponse sendVerificationCode(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 가입된 이메일 주소입니다.");
        }

        String code = String.format("%06d", random.nextInt(1000000));
        LocalDateTime expireAt = LocalDateTime.now().plusMinutes(5);

        verificationStore.put(email, new VerificationState(code, expireAt));

        boolean sentViaSmtp = false;
        if (mailSender != null && mailUsername != null && !mailUsername.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(mailUsername, "CineFlix");
                helper.setTo(email);
                helper.setSubject("[CineFlix] 회원가입 이메일 인증번호 안내");

                String html = "<div style=\"max-width: 500px; margin: 0 auto; background: #13151E; color: #FFFFFF; font-family: 'Apple SD Gothic Neo', sans-serif; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);\">"
                        + "<h1 style=\"color: #E50914; margin: 0 0 16px 0; font-size: 24px;\">🎬 CineFlix</h1>"
                        + "<h2 style=\"font-size: 18px; margin: 0 0 12px 0;\">이메일 인증번호 안내</h2>"
                        + "<p style=\"color: #A0AEC0; font-size: 14px; line-height: 1.6;\">"
                        + "시네플릭스 서비스에 오신 것을 환영합니다!<br/>"
                        + "회원가입 페이지에서 아래 6자리 인증번호를 입력해 주세요."
                        + "</p>"
                        + "<div style=\"background: rgba(255,255,255,0.06); padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0; border: 1px dashed #FFC107;\">"
                        + "<span style=\"font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #FFC107;\">" + code + "</span>"
                        + "</div>"
                        + "<p style=\"color: #718096; font-size: 12px; margin: 0;\">* 해당 인증번호는 5분 동안 유효합니다.</p>"
                        + "</div>";

                helper.setText(html, true);
                mailSender.send(message);
                sentViaSmtp = true;
                log.info("Sent verification email to {} with code {}", email, code);
            } catch (Exception e) {
                log.warn("Could not send email via SMTP (will provide dev fallback): {}", e.getMessage());
            }
        }

        log.info("[CineFlix Email Verification] Email: {}, Code: {}, SentViaSMTP: {}", email, code, sentViaSmtp);

        return EmailVerificationResponse.builder()
                .success(true)
                .message(sentViaSmtp ? "인증번호가 이메일로 전송되었습니다." : "인증번호가 발송되었습니다. (테스트 환경에서는 안내창을 확인해 주세요)")
                .devCode(sentViaSmtp ? null : code)
                .expireSeconds(300)
                .build();
    }

    public EmailVerificationResponse verifyCode(String email, String code) {
        VerificationState state = verificationStore.get(email);
        if (state == null) {
            throw new IllegalArgumentException("인증번호가 발송되지 않았거나 만료되었습니다. 다시 발송해 주세요.");
        }

        if (LocalDateTime.now().isAfter(state.getExpireAt())) {
            verificationStore.remove(email);
            throw new IllegalArgumentException("인증번호 유효 시간이 만료되었습니다. 다시 발송해 주세요.");
        }

        if (!state.getCode().equals(code != null ? code.trim() : "")) {
            throw new IllegalArgumentException("인증번호가 일치하지 않습니다. 다시 확인해 주세요.");
        }

        state.markVerified();

        return EmailVerificationResponse.builder()
                .success(true)
                .message("이메일 인증이 성공적으로 완료되었습니다.")
                .expireSeconds(0)
                .build();
    }

    public boolean isEmailVerified(String email) {
        VerificationState state = verificationStore.get(email);
        return state != null && state.isVerified();
    }

    public void clearVerification(String email) {
        verificationStore.remove(email);
    }
}
