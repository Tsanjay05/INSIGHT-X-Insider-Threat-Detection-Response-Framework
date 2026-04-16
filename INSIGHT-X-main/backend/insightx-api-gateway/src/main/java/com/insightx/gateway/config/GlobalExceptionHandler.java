package com.insightx.gateway.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public Mono<ResponseEntity<ErrorResponse>> handleResponseStatusException(
            ResponseStatusException ex,
            ServerWebExchange exchange) {
        HttpStatusCode statusCode = ex.getStatusCode();
        String requestId = exchange.getRequest().getId();
        HttpStatus status = HttpStatus.resolve(statusCode.value());
        String error = status != null ? status.getReasonPhrase() : "Error";
        String message = ex.getReason() != null ? ex.getReason() : ex.getMessage();

        return Mono.just(ResponseEntity
                .status(statusCode)
                .body(new ErrorResponse(
                        requestId,
                        error,
                        message,
                        Instant.now())));
    }

    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<ErrorResponse>> handleException(Exception ex, ServerWebExchange exchange) {
        String requestId = exchange.getRequest().getId();
        return Mono.just(ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        requestId,
                        "Internal Server Error",
                        ex.getMessage(),
                        Instant.now())));
    }

    public record ErrorResponse(String requestId, String error, String message, Instant timestamp) {
    }
}
