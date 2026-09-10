package com.example.demo.config.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class OAuth2RedirectController {

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:3000/oauth2/redirect}")
    private String redirectUri;

    @GetMapping("/oauth2/redirect")
    public String redirectOAuth2(HttpServletRequest request) {
        String queryString = request.getQueryString();
        String targetUrl = redirectUri + (queryString != null ? "?" + queryString : "");
        return "redirect:" + targetUrl;
    }

    @GetMapping("/login")
    public String redirectLogin(HttpServletRequest request) {
        String queryString = request.getQueryString();
        String frontendLoginUrl = redirectUri.replace("/oauth2/redirect", "/login");
        String targetUrl = frontendLoginUrl + (queryString != null ? "?" + queryString : "");
        return "redirect:" + targetUrl;
    }
}
