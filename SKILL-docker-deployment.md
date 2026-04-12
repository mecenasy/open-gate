# Docker Deployment Skill

## Overview

Open Gate uses Docker and Docker Compose for containerized deployment of microservices, database, and supporting infrastructure.

## Docker Architecture

### Services Structure

```dockerfile
open-gate/
├── services:
│   ├── bff-service (Port 3000)
│   ├── core-service (Port 3001)
│   ├── notify-service (Port 3002)
│   ├── postgres (Port 5432)
│   ├── redis (Port 6379)
│   └── signal-cli-rest-api (Port 8080)
```

## Docker Configuration

### Main Dockerfile

Located at `Dockerfile.dev` for development:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY src ./src
COPY scripts ./scripts

# Expose ports
EXPOSE 3000 3001 3002

# Start service
CMD ["npm", "run", "start:dev"]
```

### Production Dockerfile

For production deployment:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci --only=production

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY dist ./dist
COPY package.json ./

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## Docker Compose Configuration

### docker-compose.yaml Structure

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d ${DB_DATABASE}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # BFF Service
  bff-service:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: bff-service
    environment:
      NODE_ENV: development
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
      REDIS_URL: redis://redis:6379
      CORE_SERVICE_URL: core-service:50051
      NOTIFY_SERVICE_URL: notify-service:50052
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npx ts-node-dev -r tsconfig-paths/register --respawn --transpile-only src/bff-service/main.ts
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Core Service
  core-service:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: core-service
    environment:
      NODE_ENV: development
      PORT: 3001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE}
      REDIS_URL: redis://redis:6379
      NOTIFY_SERVICE_URL: notify-service:50052
    ports:
      - "3001:3001"
      - "50051:50051"
    depends_on:
      - postgres
      - redis
    command: npx ts-node-dev -r tsconfig-paths/register --respawn --transpile-only src/core-service/main.ts

  # Notify Service
  notify-service:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: notify-service
    environment:
      NODE_ENV: development
      PORT: 3002
      # External services (REST/HTTP APIs)
      MAIL_HOST: ${MAIL_HOST}
      MAIL_USER: ${MAIL_USER}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
      # Twilio SMS (REST API)
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
      TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN}
      # Signal Messaging (REST API to Signal CLI container)
      SIGNAL_CLI_ENDPOINT: http://signal-cli-rest-api:8080
    ports:
      - "3002:3002"         # HTTP API
      - "50052:50052"       # gRPC server (Core ↔ Notify communication)
    depends_on:
      - postgres
      - redis
      - signal-cli-rest-api # Wait for Signal REST API

  # Signal CLI REST API (optional for Signal integration)
  # Provides REST/HTTP interface for Signal messaging
  signal-cli-rest-api:
    image: bbernhard/signal-cli-rest-api:latest
    container_name: signal-cli-rest-api
    ports:
      - "8080:8080"         # REST API endpoint
    environment:
      MODE: native
    volumes:
      - signal_data:/home/signal-cli

volumes:
  postgres_data:
  redis_data:
  signal_data:
```

## Environment Variables

### .env Template

Create `.env.example` with placeholder values:

**Infrastructure & BACKEND SERVICES (gRPC communication):**

```env
# Inter-service ports (gRPC)
CORE_SERVICE_URL=core-service:50051        # gRPC from BFF
NOTIFY_SERVICE_URL=notify-service:50052    # gRPC from Core
```

**EXTERNAL SERVICES (REST/HTTP communication):**

```env
# Email (SMTP - not gRPC)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@open-gate.com

# SMS (Twilio REST API - not gRPC)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Signal (REST API - not gRPC)
SIGNAL_CLI_ENDPOINT=http://signal-cli-rest-api:8080
SIGNAL_PHONE_NUMBER=+1234567890
```

**Full .env.example:**

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=open_gate
DB_LOGGING=true

# Redis
REDIS_URL=redis://redis:6379

# Backend Services (gRPC only between services)
CORE_SERVICE_URL=core-service:50051
NOTIFY_SERVICE_URL=notify-service:50052

# External Services (REST/HTTP)
# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@open-gate.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Signal (REST API)
SIGNAL_CLI_ENDPOINT=http://signal-cli-rest-api:8080
SIGNAL_PHONE_NUMBER=+1234567890

# Third-party APIs
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Frontend
FRONTEND_URL=http://localhost:4002
```

## Common Docker Commands

### Build Services

```bash
# Build all services
docker compose build

# Build specific service
docker compose build bff-service

# Build without cache
docker compose build --no-cache
```

### Run Services

```bash
# Start all services
docker compose up

# Detached mode
docker compose up -d

# Stream logs while starting
docker compose up -v

# Specific service
docker compose up bff-service
```

### Monitor Services

```bash
# View running containers
docker compose ps

# View logs
docker compose logs

# Follow logs for specific service
docker compose logs -f bff-service

# View last 100 lines
docker compose logs --tail=100
```

### Stop and Clean Up

```bash
# Stop containers
docker compose stop

# Stop specific service
docker compose stop bff-service

# Remove containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Remove containers, volumes, and images
docker compose down -v --rmi all
```

### Debugging

```bash
# Execute command in running container
docker compose exec bff-service sh

# View container resources
docker stats bff-service

# Inspect container configuration
docker compose config

# Validate compose file
docker compose config --quiet
```

## Health Checks

Each service includes health checks in docker-compose.yaml:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s      # Check every 30 seconds
  timeout: 10s       # Wait 10 seconds for response
  retries: 3         # Fail after 3 consecutive failures
  start_period: 40s  # Wait 40s before first check
```

Implement health endpoints:

```typescript
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'bff-service',
    };
  }

  @Get('ready')
  ready() {
    // Check dependencies: database, redis, other services
    return {
      ready: true,
      dependencies: {
        database: true,
        redis: true,
        notifyService: true,
      },
    };
  }
}
```

## Production Deployment

### Optimization

```yaml
services:
  bff-service:
    build:
      context: .
      dockerfile: Dockerfile       # Production Dockerfile
      args:
        NODE_ENV: production
    restart: unless-stopped
    deploy:
      replicas: 3                  # Multiple instances
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Environment-Specific Compose Files

```bash
# Development
docker compose -f docker-compose.yml up

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Database Backup and Restore

### Backup PostgreSQL

```bash
# Create backup
docker compose exec postgres pg_dump -U postgres open_gate > backup.sql

# With compression
docker compose exec postgres pg_dump -U postgres -F c open_gate > backup.dump
```

### Restore PostgreSQL

```bash
# From SQL backup
docker compose exec -T postgres psql -U postgres open_gate < backup.sql

# From compressed dump
docker compose exec -T postgres pg_restore -U postgres -d open_gate < backup.dump
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs bff-service

# Validate compose file
docker compose config

# Check environment variables
docker compose config | grep ENV_VAR
```

### Database Connection Issues

```bash
# Verify PostgreSQL is running
docker compose ps postgres

# Test connection
docker compose exec postgres psql -U postgres -c "SELECT 1;"
```

### Port Conflicts

```bash
# Find what's using a port
lsof -i :3000
# or
netstat -tulpn | grep :3000

# Kill process
kill -9 <PID>
```

### DNS Resolution in Docker

If services can't resolve each other:

```bash
# Check Docker network
docker network ls
docker network inspect <network-name>

# Restart Docker daemon
systemctl restart docker
```

## Best Practices

### 1. Use Named Volumes

```yaml
volumes:
  postgres_data:    # Docker manages directory
  redis_data:
```

### 2. Environment Variable Management

- Never commit `.env` to git
- Use `.env.example` with placeholders
- Add `.env` to `.gitignore`

### 3. Container Health Checks

- Implement `/health` endpoint for each service
- Set appropriate timeout and retry values
- Use readiness probes in production

### 4. Log Management

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 5. Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### 6. Network Isolation

```yaml
networks:
  backend:
    driver: bridge
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build services
        run: docker compose build
      
      - name: Push to registry
        run: docker compose push
      
      - name: Deploy to production
        run: docker compose -f docker-compose.prod.yml up -d
```

## Related Documentation

- [Backend Architecture](SKILL-backend-architecture.md) - Service structure
- [Database Management](SKILL-database-management.md) - Database setup
- [Authentication](SKILL-authentication.md) - Security configuration
