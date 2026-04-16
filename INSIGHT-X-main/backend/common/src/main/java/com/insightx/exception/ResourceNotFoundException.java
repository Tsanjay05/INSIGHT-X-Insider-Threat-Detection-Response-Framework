package com.insightx.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a resource is not found
 */
public class ResourceNotFoundException extends InsightXException {
    
    public ResourceNotFoundException(String resourceType, String resourceId) {
        super(
            String.format("%s not found with id: %s", resourceType, resourceId),
            "RESOURCE_NOT_FOUND",
            HttpStatus.NOT_FOUND,
            resourceType, resourceId
        );
    }
}
