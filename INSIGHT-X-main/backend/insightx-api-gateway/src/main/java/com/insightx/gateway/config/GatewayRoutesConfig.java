package com.insightx.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

@Configuration
public class GatewayRoutesConfig {

    private static final String MOCK_ACCESS_TOKEN = "mock-access-token";

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        AuthenticationWebFilter bearerAuthFilter = new AuthenticationWebFilter(mockBearerAuthenticationManager());
        bearerAuthFilter.setSecurityContextRepository(NoOpServerSecurityContextRepository.getInstance());
        bearerAuthFilter.setServerAuthenticationConverter(bearerAuthenticationConverter());
        bearerAuthFilter.setRequiresAuthenticationMatcher(ServerWebExchangeMatchers.pathMatchers("/api/**", "/stream/**"));

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors().and()
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .logout(ServerHttpSecurity.LogoutSpec::disable)
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .addFilterAt(bearerAuthFilter, org.springframework.security.config.web.server.SecurityWebFiltersOrder.AUTHENTICATION)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/actuator/health", "/actuator/info", "/auth/**", "/api/v1/auth/**")
                        .permitAll()
                        .anyExchange().authenticated())
                .build();
    }

    private ReactiveAuthenticationManager mockBearerAuthenticationManager() {
        return authentication -> {
            String token = authentication.getCredentials() != null ? authentication.getCredentials().toString() : "";
            if (!StringUtils.hasText(token)) {
                return Mono.empty();
            }
            if (MOCK_ACCESS_TOKEN.equals(token)) {
                return Mono.just(new UsernamePasswordAuthenticationToken(
                        "demo-user",
                        token,
                        AuthorityUtils.createAuthorityList("ROLE_USER")));
            }
            return Mono.error(new BadCredentialsException("Invalid access token"));
        };
    }

    private ServerAuthenticationConverter bearerAuthenticationConverter() {
        return exchange -> {
            String authorization = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            String token = "";
            if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")) {
                token = authorization.substring("Bearer ".length()).trim();
            } else {
                // SSE/EventSource cannot set Authorization headers; allow token via query param.
                String queryToken = exchange.getRequest().getQueryParams().getFirst("access_token");
                if (!StringUtils.hasText(queryToken)) {
                    queryToken = exchange.getRequest().getQueryParams().getFirst("token");
                }
                token = queryToken != null ? queryToken.trim() : "";
            }
            if (!StringUtils.hasText(token)) {
                return Mono.empty();
            }
            return Mono.just(new UsernamePasswordAuthenticationToken(token, token));
        };
    }
}
