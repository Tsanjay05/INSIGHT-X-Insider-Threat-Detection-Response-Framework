package com.insightx.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when validation fails
 */
public class ValidationException extends InsightXException {
    
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
    }
    
    public ValidationException(String field, String message) {
        super(
            String.format("Validation failed for field '%s': %s", field, message),
            "VALIDATION_ERROR",
            HttpStatus.BAD_REQUEST,
            field, message
        );
    }
}
