package com.insightx.ingestion.connector.dlp;

import reactor.core.publisher.Flux;

public interface DlpConnector {
    Flux<DlpAlert> streamAlerts();

    String systemName();
}
