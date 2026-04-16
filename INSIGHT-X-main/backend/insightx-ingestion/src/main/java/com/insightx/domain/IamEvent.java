package com.insightx.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IamEvent {
    private String eventId;
    private Instant timestamp;
    private String userId;
    private String eventType;
    private String sourceSystem;
    private String sourceIp;
    private String userAgent;
    private Map<String, Object> metadata;
}
