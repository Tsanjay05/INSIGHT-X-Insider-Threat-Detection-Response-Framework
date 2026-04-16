# INSIGHT-X API Documentation

## Overview

The INSIGHT-X platform exposes a set of RESTful APIs via the **API Gateway** running on port `8080`.
All API requests should be prefixed with `/api/v1`.

### Base URL
`http://localhost:8080`

### Authentication
Most endpoints require a Bearer Token.
- **Header**: `Authorization: Bearer <token>`
- **Token Source**: Keycloak (OAuth2/OIDC)

## Services & Endpoints

### 1. Authentication (`/auth`)
Handled by Gateway + Keycloak.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/v1/auth/login` | Exchange credentials for token |
| POST   | `/api/v1/auth/refresh` | Refresh access token |
| POST   | `/api/v1/auth/logout` | Invalidate session |

### 2. Cases (`/cases`)
Manage investigation cases.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/cases` | List cases (paginated, filtered) |
| GET    | `/api/v1/cases/{id}` | Get case details |
| POST   | `/api/v1/cases` | Create new case |
| PUT    | `/api/v1/cases/{id}` | Update case status/assignee |
| POST   | `/api/v1/cases/{id}/comments` | Add comment |

### 3. Policies (`/controls` -> `/policies`)
Manage detection and response policies.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/controls/policies` | List active policies |
| POST   | `/api/v1/controls/policies` | Create/Update policy (OPA Rego) |
| DELETE | `/api/v1/controls/policies/{id}` | Disable policy |

### 4. Trust Engine (`/trust`)
Trust scoring and evaluation.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/trust/users/{id}` | Get current Trust State |
| GET    | `/api/v1/trust/users/{id}/history` | Get Trust Score history |
| POST   | `/api/v1/trust/evaluate` | Trigger trust evaluation (Signal input) |

### 5. Provenance & Audit (`/provenance`, `/audit`)
Explainability and audit trail.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/provenance/audit` | Search audit logs |
| GET    | `/api/v1/provenance/audit/log` | Create audit log (internal) |
| GET    | `/api/v1/provenance/timeline/{entityId}` | Get decision timeline |
| GET    | `/api/v1/provenance/explain/{decisionId}` | Get explanation factors |

## Swagger UI

Swagger UI is available for individual services (tunneling via Gateway configuration pending):

- **Gateway**: `http://localhost:8080/webjars/swagger-ui/index.html` (Aggregated)
- **Trust Engine**: `http://localhost:8081/webjars/swagger-ui/index.html`
- **Provenance**: `http://localhost:8082/webjars/swagger-ui/index.html`
