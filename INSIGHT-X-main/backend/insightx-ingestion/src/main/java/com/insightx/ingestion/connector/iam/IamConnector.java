package com.insightx.ingestion.connector.iam;

import reactor.core.publisher.Flux;

public interface IamConnector {
    Flux<IamEvent> streamEvents();

    String systemName();
}
