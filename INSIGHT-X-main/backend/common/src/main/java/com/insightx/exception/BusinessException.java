package com.insightx.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a business validation fails
 */
public class BusinessException extends InsightXException {
    
    public BusinessException(String message) {
        super(message, "BUSINESS_ERROR", HttpStatus.BAD_REQUEST);
    }
    
    public BusinessException(String message, Object... args) {
        super(message, "BUSINESS_ERROR", HttpStatus.BAD_REQUEST, args);
    }
}
