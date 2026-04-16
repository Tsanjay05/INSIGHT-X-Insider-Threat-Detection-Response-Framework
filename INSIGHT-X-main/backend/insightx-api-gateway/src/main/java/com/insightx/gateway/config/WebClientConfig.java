package com.insightx.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${insightx.trust-engine.url:http://localhost:8082}")
    private String trustEngineUrl;

    @Bean
    public WebClient trustEngineWebClient(WebClient.Builder builder) {
        return builder.baseUrl(trustEngineUrl).build();
    }
}
