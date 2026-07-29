package com.example.demo.domain.member.dto;

import com.example.demo.domain.member.entity.Member;
import com.example.demo.domain.member.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 6, message = "비밀번호는 6자리 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "닉네임은 필수입니다.")
    @Size(max = 50, message = "닉네임은 50자 이하이어야 합니다.")
    private String nickname;

    public Member toEntity(String encodedPassword) {
        return Member.builder()
                .email(email)
                .password(encodedPassword)
                .nickname(nickname)
                .role(Role.ROLE_USER)
                .build();
    }
}
