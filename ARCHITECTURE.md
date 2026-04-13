# Architecture Decision Records (ADRs)

## Overview

This document captures key architectural decisions made for the open-gate project.

---

## ADR-001: Microservices Architecture

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need for scalable, independently deployable services with clear separation of concerns.

### Decision

Use a microservices architecture with multiple independent services communicating via gRPC:

- **bff-service**: GraphQL API gateway for frontend clients
- **core-service**: Business logic and process management
- **db-service**: Centralized database access service
- **notify-service**: Push notifications, emails, SMS, Signal messaging

### Rationale

- Each service has a single responsibility
- Independent scaling of high-load services
- Technology flexibility per service
- Easier testing and deployment
- Clear boundaries via gRPC contracts

### Consequences

- Complexity in distributed tracing and debugging
- Network latency between services
- Need for circuit breakers and resilience patterns ✅ (implemented)
- Requires careful API versioning

---

## ADR-002: GraphQL for Frontend API

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need efficient data fetching for frontend with flexible querying.

### Decision

Expose frontend API via GraphQL using Apollo Server with NestJS/Apollo integration:

- Single endpoint for all queries and mutations
- Client specifies exact data needed
- Schema-first development with auto-generated types
- Introspection enabled for tooling

### Rationale

- Reduces over-fetching of data vs REST
- Strongly typed schema provides safety
- Better developer experience with Apollo Sandbox
- Natural fit with TypeScript ecosystem

### Consequences

- Team must learn GraphQL
- Schema validation needed (✅ implemented)
- Slightly larger payload complexity
- Rate limiting applied per endpoint (✅ implemented)

---

## ADR-003: gRPC for Inter-Service Communication

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need high-performance, typed communication between microservices.

### Decision

Use gRPC (protobuf3) for service-to-service communication:

- Strongly typed via .proto files
- Binary protocol for efficiency
- Connection pooling and multiplexing
- Automatic code generation

### Rationale

- 10x faster than REST + JSON
- Bidrectional streaming support
- Built-in load balancing
- Protobuf schema evolution support

### Consequences

- Learning curve for protobuf/gRPC ✅ (documented in proto files)
- Debugging harder than REST (need gRPC tools)
- Circuit breaker pattern needed ✅ (implemented)
- Proto versioning important

---

## ADR-004: NestJS as Microservice Framework

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need opinionated, scalable framework with strong TypeScript support.

### Decision

Use NestJS for all microservices:

- CQRS pattern for command/query separation
- Dependency injection for testability
- Middleware, guards, interceptors, filters for cross-cutting concerns
- Built-in validation and exception handling

### Rationale

- Enterprise-grade architecture patterns
- Strong typing with TypeScript
- Large, active ecosystem
- Excellent documentation
- Easy testing with built-in utilities

### Consequences

- Steeper learning curve than Express
- Opinionated structure  (good for team consistency)
- Performance slightly slower than raw Node (acceptable for our scale)

---

## ADR-005: Request/Response Logging

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need visibility into API traffic for debugging and auditing.

### Decision

Implement automatic request/response logging middleware:

- Log incoming request: method, path, IP, user-agent, userId
- Log outgoing response: status, duration, content-length
- Use correlation IDs for distributed tracing ✅ (implemented)
- Warn on errors (4xx+), debug on success

### Rationale

- Helps debugging production issues
- Audit trail for compliance
- Performance monitoring baseline
- Quick troubleshooting

### Consequences

- Extra logging overhead (minimal)
- Log volume can be high on production
- Need proper log aggregation (e.g., ELK)

---

## ADR-006: Rate Limiting Strategy

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need DOS protection and fair resource allocation.

### Decision

Implement multi-tier rate limiting ✅ (implemented):

- **default**: 100 requests/minute (general endpoints)
- **auth**: 5 requests/minute (login, MFA, passkeys)
- **public**: 30 requests/minute (CSRF token, public endpoints)

### Rationale

- Protects against brute-force attacks
- Prevents resource exhaustion
- Configurable per endpoint
- Returns HTTP 429 on exceed

### Consequences

- May block legitimate bulk operations (mitigated with config)
- Requires client-side retry logic
- Need monitoring for false positives

---

## ADR-007: Circuit Breaker for Resilience

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need to handle graceful degradation when downstream services fail.

### Decision

Implement circuit breaker pattern ✅ (implemented):

- States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
- Threshold: 5 failures to open, 2 successes to close
- Timeout: 60 seconds before retry
- Integrated into gRPC proxy layer

### Rationale

- Prevents cascading failures
- Fail fast when service down (better UX)
- Auto-recovery without manual intervention
- Monitoring-friendly

### Consequences

- Adds latency overhead (negligible)
- Requires proper error handling in clients
- Monitoring/alerting needed for circuit state changes

---

## ADR-008: Distributed Tracing via Correlation IDs

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need to track requests across multiple services.

### Decision

Use correlation IDs ✅ (implemented):

- Generate UUID for each incoming request
- Propagate via X-Correlation-Id header in REST
- Inject into gRPC metadata for micro-services
- Include in all logs

### Rationale

- Trace request flow across services
- Group related logs together
- Debug distributed issues
- Comply with audit requirements

### Consequences

- Overhead to tracking (minimal)
- Requires shared ID across all services

---

## ADR-009: Request Size Limits

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need DOS protection against large payload attacks.

### Decision

Configure `body-parser` limits ✅ (implemented):

- Default: 10MB per request
- Configurable via `MAX_REQUEST_SIZE` environment variable
- Applied to JSON and URL-encoded payloads

### Rationale

- Prevents memory exhaustion attacks
- Typical API payloads << 10MB
- Configurable for legitimate large payloads

### Consequences

- May reject large but legitimate requests
- Need communication with API clients about limits

---

## ADR-010: Database Connection Pooling

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need efficient database resource management.

### Decision

Configure TypeORM connection pool ✅ (implemented in Priority 2):

- Min: 2 connections (reserved)
- Max: 10 connections (per config)
- Idle timeout: 10 seconds
- Configurable via `POSTGRES_POOL_MIN/MAX`

### Rationale

- Reuse connections (expensive to create)
- Prevent resource exhaustion
- Configuration per environment
- Better performance

### Consequences

- Requires monitoring of pool usage
- Potential deadlocks if pool exhausted (edge case)

---

## ADR-011: Graceful Shutdown

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need to ensure clean shutdown without dropping in-flight requests.

### Decision

Implement graceful shutdown ✅ (implemented in Priority 2):

- NestJS `app.enableShutdownHooks()`
- Listen for SIGTERM/SIGINT
- Complete pending requests before exit
- Timeout: service-dependent

### Rationale

- No data loss or corruption
- Proper resource cleanup
- Smooth deployments
- Kubernetes-friendly

### Consequences

- Shutdown may take longer
- Need proper load balancer configuration

---

## ADR-012: Environment-Based Configuration

**Date**: April 2026  
**Status**: Accepted  
**Context**: Need flexible configuration across development, staging, production.

### Decision

Use environment variables with validation schema ✅ (implemented in Priority 2):

- `.env.example` with all required variables
- Joi schema validation on startup
- Fail fast on missing/invalid config
- Type-safe config service per module

### Rationale

- 12-factor app compatibility
- Easy secrets management via CI/CD
- Clear contract for deployment
- Early error detection

### Consequences

- No .env in git (✅ implemented)
- Requires environment setup documentation
- Boilerplate for config services

---

## Future ADRs for Priority 5+

Coming soon:

- ADR-013: Caching strategy (Redis)
- ADR-014: Search and filtering optimization
- ADR-015: API versioning strategy
- ADR-016: Database migration strategy
- ADR-017: Testing strategy (unit, integration, E2E)
