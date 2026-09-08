package com.example.demo.config.swagger;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        String jwtSchemeName = "jwtAuth";
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);
        Components components = new Components()
                .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
                        .name(jwtSchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT 인증 토큰을 입력하세요. (Bearer 키워드 제외)"));

        Info info = new Info()
                .title("🎬 CineFlix REST API 명세서")
                .description("CineFlix 영화 추천 및 위시리스트 서비스 백엔드 API 명세서입니다.")
                .version("v1.0.0")
                .contact(new Contact().name("CineFlix Dev Team").email("developer@cineflix.com"));

        Server localServer = new Server().url("http://localhost:8080").description("로컬 개발 서버");
        Server cloudServer = new Server().url("https://cineflix-backend.onrender.com").description("Render 클라우드 서버");

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, cloudServer))
                .addSecurityItem(securityRequirement)
                .components(components);
    }
}
