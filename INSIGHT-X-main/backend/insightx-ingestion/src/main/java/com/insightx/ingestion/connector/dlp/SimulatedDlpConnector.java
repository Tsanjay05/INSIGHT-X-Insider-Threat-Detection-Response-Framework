package com.insightx.ingestion.connector.dlp;

import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
public class SimulatedDlpConnector implements DlpConnector {

    @Override
    public Flux<DlpAlert> streamAlerts() {
        return Flux.interval(Duration.ofSeconds(25))
                .map(tick -> new DlpAlert(
                        UUID.randomUUID().toString(),
                        "user-" + (tick % 3),
                        tick % 5 == 0 ? "HIGH" : "LOW",
                        "PCI-DSS-Violation",
                        Instant.now(),
                        "Symantec-DLP",
                        Map.of("filename", "customer_data_" + tick + ".csv")));
    }

    @Override
    public String systemName() {
        return "Symantec-DLP-Sim";
    }
}
