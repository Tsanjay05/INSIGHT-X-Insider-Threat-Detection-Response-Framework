package com.insightx.connectors.common;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConnectorMetadata {
    private String connectorId;
    private String connectorType;
    private String version;
    private String providerName;
    private String description;
    private boolean supportsRealtime;
    private boolean supportsBatch;
}
