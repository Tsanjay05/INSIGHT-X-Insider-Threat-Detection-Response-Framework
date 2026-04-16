package com.insightx.connectors.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectorConfig {
    private String connectorId;
    private String connectorType;
    private String apiEndpoint;
    private String apiToken;
    private String apiKey;
    private Integer pollIntervalSeconds;
    private Integer batchSize;
    private Integer timeoutSeconds;
    private Map<String, String> additionalProperties;

    public String getProperty(String key) {
        return additionalProperties != null ? additionalProperties.get(key) : null;
    }
}
