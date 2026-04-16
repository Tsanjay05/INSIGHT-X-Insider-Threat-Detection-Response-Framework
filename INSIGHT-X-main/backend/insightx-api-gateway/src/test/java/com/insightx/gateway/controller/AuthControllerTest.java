package com.insightx.gateway.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.autoconfigure.security.oauth2.resource.reactive.ReactiveOAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.reactive.ReactiveSecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.reactive.ReactiveUserDetailsServiceAutoConfiguration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

@WebFluxTest(
        controllers = AuthController.class,
        excludeAutoConfiguration = {
                ReactiveSecurityAutoConfiguration.class,
                ReactiveUserDetailsServiceAutoConfiguration.class,
                ReactiveOAuth2ResourceServerAutoConfiguration.class
        })
class AuthControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void loginShouldReturnUserAndTokens() {
        webTestClient.post()
                .uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                          "email": "admin@insightx.com",
                          "password": "password"
                        }
                        """)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.accessToken").isEqualTo("mock-access-token")
                .jsonPath("$.refreshToken").isEqualTo("mock-refresh-token")
                .jsonPath("$.user.email").isEqualTo("admin@insightx.com")
                .jsonPath("$.user.role").isEqualTo("ADMIN");
    }

    @Test
    void loginShouldAlsoWorkOnVersionedPath() {
        webTestClient.post()
                .uri("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                          "email": "admin@insightx.com",
                          "password": "password"
                        }
                        """)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.accessToken").isEqualTo("mock-access-token");
    }

    @Test
    void meShouldRequireValidBearerToken() {
        webTestClient.get()
                .uri("/auth/me")
                .exchange()
                .expectStatus().isUnauthorized();

        webTestClient.get()
                .uri("/auth/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer mock-access-token")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.email").isEqualTo("admin@insightx.com");
    }
}
