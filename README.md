# Open Gate

A comprehensive microservices-based application built with **NestJS**, featuring authentication, real-time communication, and notification systems.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Skills & Documentation](#skills--documentation)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Database Management](#database-management)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [Development Guidelines](#development-guidelines)
- [Known Issues](#known-issues)
- [Support](#support)

**NEW?** 👉 Start with [WORKFLOW.md](WORKFLOW.md) - Complete tutorial on using this documentation!

## 🎯 Project Overview

**Open Gate** is an enterprise-grade application providing:

- **Authentication & Authorization** - JWT, OAuth 2.0, WebAuthn, TOTP 2FA
- **Real-time Communication** - WebSockets, Server-Sent Events, Signal messaging
- **Multi-channel Notifications** - Email, SMS (Twilio), in-app
- **Microservices Architecture** - Scalable, loosely-coupled services
- **Multiple API Interfaces** - REST, GraphQL, gRPC

## 📚 Skills & Documentation

Navigate project domains with specialized guides:

| Skill | Focus | For |
|-------|-------|-----|
| [Backend Architecture](SKILL-backend-architecture.md) | Microservices design, gRPC communication, service boundaries | Understanding system structure and service interaction |
| [CQRS Pattern](SKILL-cqrs-pattern.md) | Commands, Queries, Events, Handlers | Building business logic in Core Service |
| [Database Management](SKILL-database-management.md) | TypeORM, Entities, Migrations, Repositories | Working with PostgreSQL and data persistence |
| [Authentication & Sessions](SKILL-authentication.md) | Session management, OAuth 2.0, WebAuthn, TOTP | Implementing and troubleshooting authentication |
| [Notifications & Integrations](SKILL-notifications.md) | Email, SMS, Signal, WhatsApp (WIP), Messenger (WIP) | Setting up and using notification services |
| [Docker Deployment](SKILL-docker-deployment.md) | Docker Compose, Container management, Production deployment | Running services locally and in production |

## 🏗️ Architecture

**📖 Full guide:** [Backend Architecture Skill](SKILL-backend-architecture.md)

### Microservices

```
┌──────────────────────────────────────────────────────────┐
│                  Frontend (4002)                         │
└───────────────────────────┬──────────────────────────────┘
                            │ GraphQL/WebSocket
                            ▼
                ┌──────────────────────────┐
                │    BFF Service           │ (Backend-for-Frontend)
                │       (3000)             │
                └──────┬──────────┬────────┘
                       │          │ gRPC
           ┌───────────▼──┐  ┌────▼────────────┐
           │  Core        │◄─┤   Notify       │
           │  Service     │──┤   Service      │
           │  (3001)      │  │   (3002)       │
           │  CQRS        │  │   gRPC: 50052  │
           │  gRPC: 50051 │  └────┬───────┬───┘
           └─────┬────────┘       │       │
                 │                │       │ REST/HTTP
                 │      ┌─────────┴─┬─────▼──────┐
                 │      ▼           ▼            ▼
              DB Svc   Email      Twilio       Signal
           (Postgres)  (SMTP)     (SMS)      (REST API)
           TypeORM
```

### Communication Protocols

| Layer | Protocol | Details |
|-------|----------|---------|
| **Frontend ↔ BFF** | GraphQL + WebSocket | Session-authenticated queries/mutations/subscriptions (port 3000) |
| **BFF ↔ Core** | gRPC | Inter-service communication (port 50051) |
| **Core ↔ Notify** | gRPC | Bidirectional event streaming (port 50052) |
| **External Services** | REST/HTTP | Email (SMTP), SMS (Twilio), Signal (REST API) |

**Key principle**: Backend services communicate **only via gRPC**, external services via **REST/HTTP**

### Services Description

| Service | Purpose | Port |
|---------|---------|------|
| **BFF Service** | Main API gateway, session authentication, GraphQL, real-time features | 3000 |
| **Core Service** | Business logic, data processing, event handling | 3001 |
| **Notify Service** | Email, SMS, WhatsApp, Messenger, and in-app notifications | 3002 |
| **DB Service** | Database migrations and management | - |
| **Frontend** | Frontend application (React/Vue) | 4002 |

## 🛠️ Tech Stack

**📖 Full guides:**

- [CQRS Pattern](SKILL-cqrs-pattern.md) - Business logic patterns
- [Database Management](SKILL-database-management.md) - Data persistence
- [Authentication & Sessions](SKILL-authentication.md) - User management
- [Notifications & Integrations](SKILL-notifications.md) - Multi-channel messaging
- [Docker Deployment](SKILL-docker-deployment.md) - Containerization

### Core Framework

- **NestJS 11** - Progressive Node.js framework
- **TypeScript** - Type-safe development

### Databases & Caching

- **PostgreSQL** - Primary relational database
- **Redis** - In-memory caching and session store
- **TypeORM** - Object-Relational Mapping

### API & Communication

- **GraphQL** + Apollo Server
- **REST API** - Express.js
- **gRPC** - Inter-service communication
- **WebSockets** + Socket.IO - Real-time features

### Authentication & Session Management

- **Session-based Authentication** - Server-side session management
- **Passport.js** - Authentication middleware
- **OAuth 2.0** - Google, GitHub, LinkedIn, Facebook, Twitter, Azure AD
- **WebAuthn** - Passwordless authentication
- **TOTP** - Two-factor authentication

### External Services

- **Nodemailer** - Email sending
- **Twilio** - SMS notifications
- **Signal API** - Real-time messaging
- **WhatsApp** (WIP) - WhatsApp messaging integration
- **Messenger** (WIP) - Facebook Messenger integration

### Development & DevOps

- **Docker & Docker Compose** - Containerization
- **Jest** - Unit & E2E testing
- **ESLint + Prettier** - Code quality
- **Bull** - Queue system (Redis-backed)

## 📁 Project Structure

```
open-gate/
├── src/
│   ├── bff-service/              # Backend-for-Frontend gateway
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/                 # Authentication & JWT
│   │   ├── graphql/              # GraphQL schema & resolvers
│   │   └── ...
│   ├── core-service/             # Core business logic
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── cqrs/                 # Command & Query Handlers
│   │   ├── entities/             # Database entities
│   │   └── ...
│   ├── notify-service/           # Notification system
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── email/                # Email notifications
│   │   ├── sms/                  # SMS via Twilio
│   │   └── ...
│   ├── db-service/               # Database migrations
│   │   └── migrations/
│   ├── front-service/            # Frontend asset serving
│   ├── libs/                      # Shared utilities & types
│   ├── proto/                     # Protocol Buffer definitions
│   ├── types/                     # Shared TypeScript types
│   └── utils/                     # Common utilities
├── test/                          # E2E tests
├── scripts/                       # Automation scripts
├── docker-compose.yaml            # Service orchestration
├── typeorm.config.ts              # Database configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- **Docker** & **Docker Compose**
- **PostgreSQL** (via Docker)
- **Redis** (via Docker)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd open-gate
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the database services:**

   ```bash
   npm run docker:up
   # or longer form: docker compose up
   ```

5. **Run database migrations:**

   ```bash
   npm run migration:run
   ```

6. **Start development server:**

   ```bash
   npm run start:dev
   ```

The BFF service will be available at `http://localhost:3000`

## 📝 Available Scripts

### Development

```bash
# Start development server with watch mode
npm run start:dev

# Start debug mode
npm run start:debug

# Development build
npm run build
```

### Production

```bash
# Production build
npm run build

# Start production server
npm run start:prod

# Full deployment: install → build → migrate
npm run deploy
```

### Testing

```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Format code with Prettier
npm run format

# Lint with ESLint (with auto-fix)
npm run lint
```

### Docker Management

```bash
# Start containers
npm run docker:up

# Stop containers
npm run docker:stop

# Restart containers
npm run docker:restart

# Remove containers
npm run docker:down

# View container status
npm run docker:ps

# View logs
npm run docker:logs
```

## 🗄️ Database Management

**📖 Full guide:** [Database Management Skill](SKILL-database-management.md)

### Migrations

TypeORM migrations are managed through npm scripts:

```bash
# Create new migration (generates from current entities)
npm run migration:generate -- src/db-service/migrations/CreateUsersTable

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Production migration run
npm run migration:run:prod

# Drop entire schema (WARNING: data loss!)
npm run db:drop
```

### Database Configuration

Database settings are in [typeorm.config.ts](typeorm.config.ts) and controlled via `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=open_gate
```

## 🐳 Docker Deployment

**📖 Full guide:** [Docker Deployment Skill](SKILL-docker-deployment.md)

### Start All Services

```bash
docker compose up
# or
npm run docker:up
```

This starts:

- **PostgreSQL** - Relational database on port 5432
- **Redis** - Cache & session store on port 6379
- **BFF Service** - Main API gateway (GraphQL, WebSocket) on port 3000
- **Core Service** - Business logic on port 3001
- **Notify Service** - Notification system on port 3002
- **Signal CLI REST API** - Signal integration on port 8080 (if enabled)
- **Frontend** - React/Vue app on port 4002

### Build Docker Images

```bash
npm run docker:build
# or
docker compose build
```

### View Service Status

```bash
npm run docker:ps
# or
docker compose ps
```

### View Logs

```bash
npm run docker:logs
```

## 📡 API Documentation

**📖 Full guides:**

- [Backend Architecture](SKILL-backend-architecture.md) - gRPC and communication patterns
- [Notifications & Integrations](SKILL-notifications.md) - Notification API endpoints

### Frontend API (GraphQL Only)

- **Protocol**: GraphQL + WebSocket
- **Endpoint**: `http://localhost:3000/graphql`
- **Transport**: HTTP/WebSocket on port 3000
- **Features**:
  - Queries for read operations
  - Mutations for write operations
  - Subscriptions for real-time updates via WebSocket
- **Playground**: Available in development mode (Apollo Studio)

### Backend Inter-Service Communication (gRPC Only)

- **BFF ↔ Core**: gRPC on port 50051
- **Core ↔ Notify**: gRPC on port 50052
- **Proto definition**: `/src/proto/`
- No REST endpoints between backend services

### External Service APIs (REST/HTTP)

- **Email**: SMTP via Nodemailer
- **SMS**: Twilio REST API
- **Messaging**: Signal REST API (<http://signal-cli-rest-api:8080>)

### Postman Collection

API endpoints are documented in [postman_collection.json](postman_collection.json). Import into Postman for GraphQL testing.

## 👨‍💻 Development Guidelines

**📖 Full guides:**

- [Backend Architecture](SKILL-backend-architecture.md) - Service design patterns
- [CQRS Pattern](SKILL-cqrs-pattern.md) - Command and Query handling
- [Authentication & Sessions](SKILL-authentication.md) - User authentication flow

### Module Generation

Use the provided generator scripts to create new modules:

```bash
# Generate a new module with scaffold
npm run build && npx ts-node -r ts-node/register -r tsconfig-paths/register scripts/module-generator.ts
```

### Code Style

- **Language**: TypeScript (strict mode enabled)
- **Formatting**: Prettier (run `npm run format`)
- **Linting**: ESLint (run `npm run lint`)

### CQRS Pattern

Core service uses Command Query Responsibility Segregation. Learn more in [CQRS Pattern Skill](SKILL-cqrs-pattern.md):

```typescript
// Commands - Write operations
export class CreateUserCommand {
  constructor(public readonly data: CreateUserDto) {}
}

// Queries - Read operations
export class GetUserQuery {
  constructor(public readonly id: string) {}
}
```

### Error Handling

Standardized error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## ⚠️ Known Issues

**📖 Details in:** [TODO.md](TODO.md)

### Priority 1 - Critical

- ❌ **Missing Tests** - Insufficient unit and E2E test coverage (<5%)
  - Action: Add tests for services, CQRS handlers, guards, and interceptors
  - Related: [CQRS Pattern](SKILL-cqrs-pattern.md), [Backend Architecture](SKILL-backend-architecture.md)
  
- ❌ **Credentials in Repository** - API keys in `.env` are committed
  - Action: Remove `.env`, add `.env.example`, update `.gitignore`
  - Related: [Docker Deployment](SKILL-docker-deployment.md)
  
- ❌ **Dev Mode Backdoor** - `AuthGuard` bypasses validation when `DEV_MODE=true`
  - Action: Remove or restrict to local environment only
  - Related: [Authentication & Sessions](SKILL-authentication.md)

- ❌ **Missing Global Exception Filter** - Inconsistent error responses
  - Action: Implement centralized `GlobalExceptionFilter`
  - Related: [Backend Architecture](SKILL-backend-architecture.md)

### Priority 2 - High

- ❌ **Console Logging** - 336 files use `console.log` instead of NestJS `Logger`
  - Action: Replace with proper logging infrastructure
  - Related: [Backend Architecture](SKILL-backend-architecture.md)
  
- ❌ **Environment Validation** - No schema validation for `.env` variables
  - Action: Use `Joi` or `class-validator` for validation
  - Related: [Docker Deployment](SKILL-docker-deployment.md)

- ❌ **CSRF Protection Disabled** - Security feature commented out
  - Action: Enable and test CSRF protection
  - Related: [Authentication & Sessions](SKILL-authentication.md)

### Priority 3 - Medium

- 🔄 **Correlation ID** - Missing between microservices
  - Action: Add `X-Correlation-ID` tracking across services
  - Related: [Backend Architecture](SKILL-backend-architecture.md)

## 📞 Support

**📖 New to the project?** Start with [WORKFLOW.md](WORKFLOW.md) - Complete guide on how to use this documentation system!

For issues or questions:

1. **Skills & Documentation** - Start with specialized guides:
   - [Backend Architecture](SKILL-backend-architecture.md)
   - [CQRS Pattern](SKILL-cqrs-pattern.md)
   - [Database Management](SKILL-database-management.md)
   - [Authentication & Sessions](SKILL-authentication.md)
   - [Notifications & Integrations](SKILL-notifications.md)
   - [Docker Deployment](SKILL-docker-deployment.md)

2. Check existing issues in the repository
3. Review [TODO.md](TODO.md) for planned improvements
4. Check [SKILLS.md](SKILLS.md) for technology stack details

## 📄 License

UNLICENSED - Private project

---

**Author:** Marcin Gajda  
**Last Updated:** April 2024  
**Version:** 0.0.2
