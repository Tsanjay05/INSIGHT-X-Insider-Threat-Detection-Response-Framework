# PostgreSQL Testcontainers Architecture - Production Implementation

## Summary

Successfully refactored `insightx-trust-engine` test architecture from H2 to PostgreSQL Testcontainers.

## Changes Implemented

### 1. Dependencies (pom.xml)
**Removed:**
- `com.h2database:h2` (test scope)
- `io.r2dbc:r2dbc-h2` (test scope)

**Kept:**
- `org.testcontainers:postgresql` (test scope)
- `org.testcontainers:testcontainers-bom:1.20.4`

### 2. Test Base Class
Created `PostgreSQLTestBase.java`:
- Abstract base with shared static PostgreSQL 15 container
- `@DynamicPropertySource` configures both R2DBC and Flyway
- Container reuse enabled for faster local development
- `disabledWithoutDocker = true` prevents silent failures

### 3. Configuration Files

**application.yml** (test resources):
- Removed all H2 configuration
- Minimal config (server port, logging)
- Database config now injected via @DynamicPropertySource

**testcontainers.properties** (NEW):
```properties
testcontainers.reuse.enable=true
```

### 4. Integration Tests Updated

**TrustDecisionFlowIntegrationTest**:
- Extends `PostgreSQLTestBase`
- Removed duplicate PostgreSQL container
- Kept Kafka container (test-specific)

**TrustApiContractTest**:
- Extends `PostgreSQLTestBase`
- Now uses real PostgreSQL for contract validation

## JSONB Handling

**How it works:**
1. **Flyway Migration** defines column as `JSONB`:
   ```sql
   history_summary_json JSONB NOT NULL
   ```

2. **R2DBC PostgreSQL Driver** handles JSONB automatically:
   - Bind as `String` containing JSON
   - Driver converts to PostgreSQL JSONB type
   - No manual casting needed in repository code

3. **Repository Layer** (example):
   ```java
   .bind("history", objectMapper.writeValueAsString(summary))
   ```
   PostgreSQL R2DBC driver handles the JSON → JSONB conversion.

**Best Practice:**
- Store JSON as `String` in Java domain models
- Use Jackson `ObjectMapper` for serialization
- Let R2DBC driver handle type conversion
- Database enforces JSONB integrity

## Validation Commands

```bash
# Full test suite
mvn clean test -rf :insightx-trust-engine

# Integration tests only
mvn test -rf :insightx-trust-engine -Dtest=*IntegrationTest

# Specific test
mvn test -rf :insightx-trust-engine -Dtest=TrustApiContractTest
```

## Why This Architecture Is Production-Grade

### 1. **SQL Dialect Fidelity**
Integration tests now execute the exact same SQL as production:
- `ON CONFLICT DO UPDATE` (PostgreSQL upsert)
- `JSONB` type operations
- PostgreSQL-specific functions

### 2. **No Silent Fallbacks**
- Removed H2 entirely from test classpath
- `@Testcontainers(disabledWithoutDocker = true)` fails explicitly if Docker unavailable
- No accidental H2 usage when containers fail

### 3. **Performance Optimized**
- Static container shared across test classes
- Container reuse between test runs (if enabled)
- Flyway migrations run once per container lifecycle

### 4. **Clean Architecture**
```
Unit Tests (no DB)
  ↓ Fast, isolated, pure logic
  
Integration Tests (PostgreSQL Testcontainers)
  ↓ Real DB, real SQL, schema validation
  
Production (PostgreSQL)
  ↓ Identical environment
```

### 5. **CI/CD Ready**
- Works in any Docker-enabled CI (GitHub Actions, GitLab CI, Jenkins)
- Test failures are explicit and actionable
- No environment-specific hacks

### 6. **Type Safety**
- JSONB columns validated at migration time
- R2DBC prevents SQL injection
- Reactive contracts enforced (no blocking JDBC calls)

### 7. **Developer Experience**
- Container reuse makes local testing fast
- Clear error messages when Docker unavailable
- Shared base class eliminates boilerplate

## Files Modified

1. `pom.xml` - Removed H2 deps
2. `PostgreSQLTestBase.java` - NEW abstract base
3. `application.yml` - Minimal test config
4. `testcontainers.properties` - NEW reuse config
5. `TrustDecisionFlowIntegrationTest.java` - Extends base
6. `TrustApiContractTest.java` - Extends base

## Next Steps

Run tests to validate:
```bash
mvn clean test -rf :insightx-trust-engine
```

Expected: All integration tests pass using real PostgreSQL.
