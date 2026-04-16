package com.insightx.gateway.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/auth", "/auth"})
public class AuthController {

    private static final String DEMO_EMAIL = "admin@insightx.com";
    private static final String DEMO_PASSWORD = "password";
    private static final String DEMO_ACCESS_TOKEN = "mock-access-token";
    private static final String DEMO_REFRESH_TOKEN = "mock-refresh-token";
    private static final long TOKEN_TTL_SECONDS = 3600L;
    private static final Instant DEMO_CREATED_AT = Instant.parse("2024-01-01T00:00:00Z");
    private static final List<String> DEMO_PERMISSIONS = List.of(
            "system:admin",
            "users:view",
            "reports:view");

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody(required = false) LoginRequest req) {
        if (req != null
                && DEMO_EMAIL.equalsIgnoreCase(req.email())
                && DEMO_PASSWORD.equals(req.password())) {
            return ResponseEntity.ok(new LoginResponse(
                    buildDemoUser(),
                    DEMO_ACCESS_TOKEN,
                    DEMO_REFRESH_TOKEN,
                    TOKEN_TTL_SECONDS));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@RequestBody(required = false) RefreshTokenRequest req) {
        if (req != null && DEMO_REFRESH_TOKEN.equals(req.refreshToken())) {
            return ResponseEntity.ok(new RefreshTokenResponse(
                    DEMO_ACCESS_TOKEN,
                    DEMO_REFRESH_TOKEN,
                    TOKEN_TTL_SECONDS));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        if (!DEMO_ACCESS_TOKEN.equals(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(buildDemoUser());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    private static UserResponse buildDemoUser() {
        Instant now = Instant.now();
        return new UserResponse(
                "user-1",
                DEMO_EMAIL,
                "John Admin",
                "ADMIN",
                "ACTIVE",
                DEMO_PERMISSIONS,
                "https://ui-avatars.com/api/?name=John+Admin&background=306FFF&color=fff",
                "Security Operations",
                now.toString(),
                DEMO_CREATED_AT.toString(),
                now.toString());
    }

    private static String extractBearerToken(String authorizationHeader) {
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
            return "";
        }
        return authorizationHeader.substring("Bearer ".length()).trim();
    }

    public record LoginRequest(String email, String password) {
    }

    public record RefreshTokenRequest(String refreshToken) {
    }

    public record LoginResponse(UserResponse user, String accessToken, String refreshToken, long expiresIn) {
    }

    public record RefreshTokenResponse(String accessToken, String refreshToken, long expiresIn) {
    }

    public record UserResponse(
            String id,
            String email,
            String name,
            String role,
            String status,
            List<String> permissions,
            String avatar,
            String department,
            String lastLogin,
            String createdAt,
            String updatedAt) {
    }
}
