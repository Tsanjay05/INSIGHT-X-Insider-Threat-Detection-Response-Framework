package com.insightx.gateway.observability;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class GatewayRequestLogger implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(GatewayRequestLogger.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        long startTime = System.currentTimeMillis();
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();

        return chain.filter(exchange)
                .doFinally(signalType -> {
                    long duration = System.currentTimeMillis() - startTime;
                    int statusCode = 500;
                    if (exchange.getResponse().getStatusCode() != null) {
                        statusCode = exchange.getResponse().getStatusCode().value();
                    }
                    logger.info("{} {} {}ms status={}", method, path, duration, statusCode);
                });
    }
}
