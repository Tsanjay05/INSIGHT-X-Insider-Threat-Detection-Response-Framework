package com.insightx.trust.integration;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * Abstract base class for integration tests requiring PostgreSQL database.
 * 
 * <p>
 * This class ensures all integration tests use a real PostgreSQL database
 * via Testcontainers, eliminating H2 dialect mismatches and ensuring
 * production-grade
 * SQL compatibility (ON CONFLICT, JSONB, etc.).
 * </p>
 * 
 * <p>
 * <strong>Container Reuse:</strong> The container is static and shared across
 * all tests extending this base class within the same JVM session. Enable reuse
 * via testcontainers.properties for faster local development.
 * </p>
 * 
 * <p>
 * <strong>Reactive R2DBC:</strong> Flyway uses JDBC for migrations, R2DBC for
 * application queries. Both are configured to point to the same Testcontainer
 * instance.
 * </p>
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
public abstract class PostgreSQLTestBase {

    /**
     * Shared PostgreSQL 15 container for all integration tests.
     * Static to ensure container reuse across multiple test classes.
     */
    @Container
    protected static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgres:15-alpine"))
            .withDatabaseName("trustdb")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true); // Enable container reuse if testcontainers.reuse.enable=true

    /**
     * Dynamically configure Spring properties to use the Testcontainer PostgreSQL
     * instance.
     * 
     * <p>
     * R2DBC URL format: r2dbc:postgresql://host:port/database
     * </p>
     * <p>
     * Flyway requires JDBC URL for schema migrations.
     * </p>
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // R2DBC configuration for reactive queries
        registry.add("spring.r2dbc.url", () -> String.format(
                "r2dbc:postgresql://%s:%d/%s",
                postgres.getHost(),
                postgres.getFirstMappedPort(),
                postgres.getDatabaseName()));
        registry.add("spring.r2dbc.username", postgres::getUsername);
        registry.add("spring.r2dbc.password", postgres::getPassword);

        // Flyway configuration for migrations (requires JDBC)
        registry.add("spring.flyway.url", postgres::getJdbcUrl);
        registry.add("spring.flyway.user", postgres::getUsername);
        registry.add("spring.flyway.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
    }
}
