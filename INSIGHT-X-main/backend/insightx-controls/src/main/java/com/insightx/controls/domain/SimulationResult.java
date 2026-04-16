package com.insightx.controls.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import io.r2dbc.postgresql.codec.Json;
import java.time.Instant;

@Table("simulation_results")
public record SimulationResult(
                @Id String simulationId,
                String decisionId,
                String entityId,
                Json simulatedOutcome,
                Instant createdAt) {
}
