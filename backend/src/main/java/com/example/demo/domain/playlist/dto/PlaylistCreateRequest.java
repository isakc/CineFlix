package com.example.demo.domain.playlist.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "영화 플레이리스트 생성 요청 DTO")
public class PlaylistCreateRequest {

    @Schema(description = "사용자 식별자(닉네임 또는 게스트ID)", example = "무비마스터")
    @NotBlank
    private String userIdentifier;

    @Schema(description = "플레이리스트 제목", example = "🌧️ 비 오는 날 밤 혼자 보기 좋은 명작 SF")
    @NotBlank
    private String title;

    @Schema(description = "플레이리스트 설명", example = "잔잔하고 몰입감 넘치는 분위기 있는 영화 컬렉션 모음")
    private String description;

    @Schema(description = "공개 여부", example = "true")
    @JsonProperty("isPublic")
    @JsonAlias({"public", "is_public"})
    @Builder.Default
    private boolean isPublic = true;

    @JsonProperty("isPublic")
    public boolean isPublic() {
        return isPublic;
    }

    @JsonProperty("isPublic")
    public boolean getIsPublic() {
        return isPublic;
    }

    @JsonProperty("isPublic")
    public void setIsPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
}
