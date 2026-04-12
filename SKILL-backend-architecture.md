# Backend Architecture Skill

## Overview

This skill provides guidance for working with Open Gate's microservices architecture, built on NestJS with gRPC inter-service communication.

## Architecture Principles

### Service Boundaries

**BFF Service (Backend-for-Frontend)**

- Port: 3000
- Role: Main API gateway, authentication, GraphQL & REST endpoints
- Responsibilities:
  - Session management and authentication
  - HTTP/WebSocket communication with frontend
  - GraphQL resolver orchestration
  - Real-time features via Socket.IO

**Core Service**

- Port: 3001
- Role: Business logic and domain operations
- Responsibilities:
  - CQRS command/query handling
  - Entity management
  - Data processing and validation
  - Bidirectional gRPC communication with Notify Service

**Notify Service**

- Port: 3002
- Role: Notification delivery system
- Responsibilities:
  - Email/SMS/Signal/WhatsApp/Messenger delivery
  - Event-driven notification processing
  - Third-party service integrations
  - Bidirectional gRPC communication with Core Service

## Communication Patterns

### Backend Services Use Only gRPC

**gRPC Communication Between Services:**

1. **BFF ↔ Core**: gRPC on port 50051
   - High-performance RPC for inter-service calls
   - Proto files located in `/src/proto/`
   - Use Protocol Buffers for message definition

2. **Core ↔ Notify**: gRPC on port 50052 (bidirectional)
   - Core sends events to Notify for notification delivery
   - Notify acknowledges receipt and status updates
   - Supports bidirectional streaming
   - Metadata for correlation tracking

**Frontend ↔ Backend: GraphQL Only**

- **GraphQL endpoint** on BFF Service (3000)
- **No REST endpoints** between Frontend and BFF
- WebSocket for real-time subscriptions
- Session-based authentication via HttpOnly cookies

**External Services: REST/HTTP**

- **Email**: SMTP via Nodemailer
- **SMS**: Twilio REST API
- **Signal**: Signal CLI REST API or Official API
- **WhatsApp**: REST API (WIP)
- **Messenger**: REST API (WIP)

### Message Flow

```typescript
// 1. Frontend requests data via GraphQL
Frontend → {GraphQL/WebSocket} → BFF Service (3000)

// 2. BFF calls Core service via gRPC
BFF → {gRPC:50051} → Core Service (3001)

// 3. Core calls Notify service via gRPC
Core → {gRPC:50052} → Notify Service (3002)

// 4. Notify calls external services via REST/HTTP
Notify → {REST/HTTP} → Email/SMS/Signal/WhatsApp APIs

// 5. All services access shared database
All Services → {TCP} → PostgreSQL (5432)
```

## Shared Libraries

### `/src/libs/`

Common utilities shared across services:

- Shared DTOs and interfaces
- Auth decorators and guards
- Error handling utilities
- Logger instances

### `/src/types/`

Application-wide type definitions

### `/src/utils/`

Common utility functions

## Key Patterns

### Environment-based Service Discovery

Services discover each other via environment variables:

```typescript
// bff-service looks up core-service
const coreServiceUrl = process.env.CORE_SERVICE_URL || 'core-service:50051';
```

### Transactional Operations

Use TypeORM transactions for multi-step database operations:

```typescript
await entityManager.transaction(async (transactionalEntityManager) => {
  // Multiple database operations
});
```

### Error Handling

- Use consistent error codes across services
- Return standardized error responses
- Implement global exception filters

## Best Practices

### 1. Service Independence

- Each service has its own database schema
- Minimal coupling between services
- Clear service contracts (gRPC proto files)

### 2. Configuration Management

- Use environment variables for service URLs
- Validate config on startup with Joi/class-validator
- Use `.env.example` for template with placeholders

### 3. Logging

- Use NestJS Logger instead of console.log
- Include correlation ID for tracing requests
- Different log levels: log, warn, error, debug

### 4. Testing

- Unit tests for business logic with Jest
- E2E tests in `/test/` directory
- Mock gRPC services for isolated testing

### 5. Database Access

- Use TypeORM entities for type safety
- Repository pattern for data access
- Migrations for schema changes

## Troubleshooting

### gRPC Connection Issues

1. Verify service is running on expected port
2. Check Proto file compilation
3. Validate gRPC metadata in requests

### Service Discovery Failures

1. Verify environment variables are set
2. Check Docker network configuration
3. Validate DNS resolution in Docker Compose

### Transaction Failures

1. Ensure database is accessible
2. Check for connection pool exhaustion
3. Verify transaction isolation level

## Related Documentation

- [Development Guidelines](README.md#development-guidelines) - Code style and patterns
- [Database Management](README.md#database-management) - TypeORM and migrations
- [CQRS Pattern](SKILL-cqrs-pattern.md) - Command and Query handling
