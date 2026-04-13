# Multi-Tenant Implementation Guide — kod samples & checklist

---

## 1️⃣ Shared Libraries — Do Utworzenia

### Library @app/config

**Plik:** `src/libs/config/src/config.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

export interface AppConfig {
  node_env: string;
  port: number;
  service_name: string;
  log_level: string;
  provider: 'aws' | 'gcp' | 'local';
}

export interface DbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  pool_min: number;
  pool_max: number;
}

export const appConfigSchema = {
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  PORT: Joi.number().default(3000),
  SERVICE_NAME: Joi.string().required(),
  LOG_LEVEL: Joi.string().default('info'),
};

export const dbConfigSchema = {
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_POOL_MIN: Joi.number().default(2),
  DB_POOL_MAX: Joi.number().default(10),
};

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ...appConfigSchema,
        ...dbConfigSchema,
      }),
    }),
  ],
  exports: [ConfigService],
})
export class AppConfigModule {}
```

**Plik:** `src/libs/config/package.json`

```json
{
  "name": "@app/config",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"]
}
```

**Plik:** `tsconfig.paths.json` (update)

```json
{
  "compilerOptions": {
    "paths": {
      "@app/config": ["src/libs/config/src"],
      "@app/config/*": ["src/libs/config/src/*"]
    }
  }
}
```

---

### Library @app/tenant

**Plik:** `src/libs/tenant/src/tenant.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
  customizationId?: string;
  correlationId: string;
  userId?: string;
}

const tenantStorage = new AsyncLocalStorage<TenantContext>();

@Injectable()
export class TenantService {
  /**
   * Set tenant context for current request
   */
  setTenantContext(context: TenantContext): void {
    tenantStorage.enterWith(context);
  }

  /**
   * Get tenant context for current request
   */
  getTenantContext(): TenantContext | undefined {
    return tenantStorage.getStore();
  }

  /**
   * Get tenant ID or throw
   */
  getTenantIdOrThrow(): string {
    const context = this.getTenantContext();
    if (!context?.tenantId) {
      throw new Error('Tenant context not found. Missing TenantInterceptor?');
    }
    return context.tenantId;
  }

  /**
   * Run code in specific tenant context
   */
  async runInContext<T>(
    context: TenantContext,
    fn: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      tenantStorage.run(context, async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
```

**Plik:** `src/libs/tenant/src/tenant.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantService, TenantContext } from './tenant.service';
import { JwtService } from '@nestjs/jwt';
import { Metadata } from '@grpc/grpc-js';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantService: TenantService,
    private readonly jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const correlationId = uuid();

    // HTTP Request
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const tenantContext = this.resolveTenantFromHttp(request);
      
      // Set correlation ID
      request.correlationId = correlationId;
      (request as any).tenantContext = tenantContext;

      // Store in AsyncLocalStorage
      this.tenantService.setTenantContext({
        ...tenantContext,
        correlationId,
      });
    }

    // gRPC Request
    if (context.getType() === 'rpc') {
      const call = context.switchToRpc().getContext();
      const tenantContext = this.resolveTenantFromGrpc(call);

      this.tenantService.setTenantContext({
        ...tenantContext,
        correlationId,
      });
    }

    return next.handle();
  }

  private resolveTenantFromHttp(request: any): Omit<TenantContext, 'correlationId'> {
    // Priority 1: JWT Token
    const token = this.extractToken(request);
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        if (payload.tenant_id) {
          return {
            tenantId: payload.tenant_id,
            tenantSlug: payload.tenant_slug || 'default',
            schemaName: `public_${payload.tenant_id.replace(/-/g, '')}`,
            customizationId: payload.customization_id,
            userId: payload.sub,
          };
        }
      } catch (error) {
        // Token invalid, continue to other methods
      }
    }

    // Priority 2: Subdomain
    const subdomain = this.extractSubdomain(request.hostname);
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      return {
        tenantId: subdomain, // Or lookup from DB
        tenantSlug: subdomain,
        schemaName: `public_${subdomain}`,
      };
    }

    // Priority 3: Header X-Tenant-Id
    const tenantFromHeader = request.headers['x-tenant-id'];
    if (tenantFromHeader) {
      return {
        tenantId: tenantFromHeader,
        tenantSlug: tenantFromHeader,
        schemaName: `public_${tenantFromHeader}`,
      };
    }

    // Default: single tenant mode
    return {
      tenantId: 'default-tenant',
      tenantSlug: 'default',
      schemaName: 'public',
    };
  }

  private resolveTenantFromGrpc(call: any): Omit<TenantContext, 'correlationId'> {
    const metadata = call as Metadata;
    const tenantId = metadata.get('x-tenant-id')?.[0] as string;
    const userId = metadata.get('x-user-id')?.[0] as string;

    return {
      tenantId: tenantId || 'default-tenant',
      tenantSlug: tenantId || 'default',
      schemaName: `public_${tenantId}`,
      userId,
    };
  }

  private extractToken(request: any): string | null {
    const authorization = request.headers.authorization;
    if (!authorization) return null;

    const [scheme, token] = authorization.split(' ');
    return scheme === 'Bearer' ? token : null;
  }

  private extractSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts[0];
    }
    return null;
  }
}
```

---

### Library @app/cqrs

**Plik:** `src/libs/cqrs/src/base/base.command-handler.ts`

```typescript
import { CommandHandler as CqrsCommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject, Optional } from '@nestjs/common';
import { TenantService, TENANT_SERVICE_TOKEN } from '@app/tenant';

/**
 * Base class for all command handlers
 * Handles common concerns:
 * - Logging
 * - Error handling
 * - Tenant context
 * - Authorization
 */
export abstract class BaseCommandHandler<TCommand, TResult = void>
  implements ICommandHandler<TCommand> {
  
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(Optional()) @Optional() protected tenantService?: TenantService,
  ) {}

  async execute(command: TCommand): Promise<TResult> {
    const commandName = command.constructor.name;
    const tenantId = this.tenantService?.getTenantContext()?.tenantId || 'unknown';

    this.logger.log(`Executing ${commandName} for tenant ${tenantId}`, {
      command: this.sanitizeCommand(command),
      tenantId,
    });

    try {
      const startTime = Date.now();
      const result = await this.executeCommand(command);
      const duration = Date.now() - startTime;

      this.logger.debug(`${commandName} completed in ${duration}ms`, {
        tenantId,
        duration,
      });

      return result;
    } catch (error) {
      this.logger.error(`${commandName} failed`, error, {
        command: this.sanitizeCommand(command),
        tenantId,
      });
      throw error;
    }
  }

  /**
   * Override this method to implement command logic
   */
  protected abstract executeCommand(command: TCommand): Promise<TResult>;

  /**
   * Remove sensitive data before logging
   */
  protected sanitizeCommand(command: any): any {
    const sanitized = { ...command };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }

  /**
   * Get tenant ID or throw error
   */
  protected getTenantId(): string {
    return this.tenantService?.getTenantIdOrThrow() || 'unknown';
  }
}
```

**Plik:** `src/libs/cqrs/src/base/base.query-handler.ts`

```typescript
import { QueryHandler as CqrsQueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, Inject, Optional, ForbiddenException } from '@nestjs/common';
import { TenantService } from '@app/tenant';

export abstract class BaseQueryHandler<TQuery, TResult>
  implements IQueryHandler<TQuery> {
  
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(Optional()) @Optional() protected tenantService?: TenantService,
  ) {}

  async execute(query: TQuery): Promise<TResult> {
    const queryName = query.constructor.name;
    const tenantId = this.tenantService?.getTenantContext()?.tenantId || 'unknown';

    this.logger.debug(`Executing ${queryName} for tenant ${tenantId}`, {
      query: this.sanitizeQuery(query),
      tenantId,
    });

    try {
      const result = await this.executeQuery(query);
      this.logger.debug(`${queryName} returned ${JSON.stringify(result).length} bytes`);
      return result;
    } catch (error) {
      this.logger.error(`${queryName} failed`, error);
      throw error;
    }
  }

  protected abstract executeQuery(query: TQuery): Promise<TResult>;

  protected sanitizeQuery(query: any): any {
    const sanitized = { ...query };
    const sensitiveFields = ['password', 'token', 'secret'];
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }

  protected getTenantId(): string {
    return this.tenantService?.getTenantIdOrThrow() || 'unknown';
  }
}
```

---

## 2️⃣ Migration Database — SQL Scripts

**Plik:** `src/db-service/migrations/multi-tenant-setup.sql`

```sql
-- ============================================================================
-- MULTI-TENANT SETUP — Run this on first multi-tenant deployment
-- ============================================================================

-- Schema for shared/global configuration (accessible to all)
CREATE SCHEMA IF NOT EXISTS shared_config;

-- ============================================================================
-- SHARED TABLES (across all tenants)
-- ============================================================================

CREATE TABLE shared_config.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,                    -- URL-friendly name
  schema_name TEXT NOT NULL UNIQUE,             -- public_xxxxx
  customization_id UUID,
  status TEXT DEFAULT 'active',                 -- 'active', 'suspended', 'archived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_tenants_slug (slug),
  INDEX idx_tenants_status (status)
);

-- Tenant-to-legacy system mapping (for Gate-Service)
CREATE TABLE shared_config.tenant_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_system_id TEXT NOT NULL,               -- ID from legacy system
  tenant_id UUID NOT NULL REFERENCES shared_config.tenants(id),
  status TEXT DEFAULT 'pending',                -- 'pending', 'mapped', 'migrated'
  created_at TIMESTAMP DEFAULT NOW(),
  mapped_at TIMESTAMP,
  
  INDEX idx_mappings_legacy (legacy_system_id),
  INDEX idx_mappings_tenant (tenant_id)
);

-- Customization config per tenant
CREATE TABLE shared_config.customization_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES shared_config.tenants(id),
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  
  -- Features
  features JSONB DEFAULT '{"enableMFA": true, "enablePasskey": true}',
  
  -- Messaging config
  default_sms_provider TEXT DEFAULT 'twilio',  -- 'twilio', 'legacy', etc
  sms_rate_limit INTEGER DEFAULT 100,          -- per minute
  
  -- Command processing
  command_timeout_ms INTEGER DEFAULT 30000,
  command_max_retries INTEGER DEFAULT 3,
  
  -- Compliance
  data_residency TEXT,                          -- 'EU', 'US', 'APAC'
  encryption_enabled BOOLEAN DEFAULT true,
  
  -- Custom extensions
  custom_config JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_customization_tenant (tenant_id)
);

-- ============================================================================
-- SAMPLE TENANT CREATION
-- ============================================================================

-- Insert first tenant
INSERT INTO shared_config.tenants (slug, schema_name, status)
VALUES (
  'default-community',
  'public_default_community',
  'active'
) RETURNING id;

-- Create schema for this tenant (save the ID from above, let's say it's 'abc123')
CREATE SCHEMA public_default_community;

-- Initialize customization for this tenant (use the tenant_id from above)
INSERT INTO shared_config.customization_configs (tenant_id)
VALUES ((SELECT id FROM shared_config.tenants WHERE slug = 'default-community'));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Create new tenant with schema
CREATE OR REPLACE FUNCTION create_new_tenant(
  p_slug TEXT,
  p_customization_config JSONB DEFAULT NULL
)
RETURNS TABLE(tenant_id UUID, schema_name TEXT) AS $$
DECLARE
  v_tenant_id UUID;
  v_schema_name TEXT;
BEGIN
  v_schema_name := 'public_' || REPLACE(p_slug, '-', '_');
  
  -- Insert tenant record
  INSERT INTO shared_config.tenants (slug, schema_name)
  VALUES (p_slug, v_schema_name)
  RETURNING id INTO v_tenant_id;
  
  -- Create schema
  EXECUTE format('CREATE SCHEMA %I', v_schema_name);
  
  -- Create default customization
  INSERT INTO shared_config.customization_configs (tenant_id, custom_config)
  VALUES (v_tenant_id, COALESCE(p_customization_config, '{}'));
  
  RETURN QUERY SELECT v_tenant_id, v_schema_name;
END;
$$ LANGUAGE plpgsql;

-- Get tenant info
CREATE OR REPLACE FUNCTION get_tenant_by_slug(p_slug TEXT)
RETURNS TABLE(id UUID, schema_name TEXT, customization_id UUID) AS $$
  SELECT t.id, t.schema_name, c.id
  FROM shared_config.tenants t
  LEFT JOIN shared_config.customization_configs c ON c.tenant_id = t.id
  WHERE t.slug = p_slug AND t.status = 'active';
$$ LANGUAGE SQL;
```

---

## 3️⃣ Gate-Service — Structure

**Plik:** `src/gate-service/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiBridgeModule } from './api-bridge/api-bridge.module';
import { DbAdapterModule } from './db-adapter/db-adapter.module';
import { SmsRouterModule } from './sms-router/sms-router.module';
import { OrchestrationModule } from './orchestration/orchestration.module';
import { TenantMapping } from './common/entities/tenant-mapping.entity';
import { CustomizationConfig } from '@app/customization/entities/customization-config.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.GATE_DB_HOST || 'postgres',
      port: parseInt(process.env.GATE_DB_PORT || '5432'),
      username: process.env.GATE_DB_USER,
      password: process.env.GATE_DB_PASSWORD,
      database: process.env.GATE_DB_NAME,
      schema: 'shared_config',                 // Gate-Service uses shared schema
      entities: [TenantMapping, CustomizationConfig],
      synchronize: false,
    }),
    ApiBridgeModule,
    DbAdapterModule,
    SmsRouterModule,
    OrchestrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Plik:** `src/gate-service/api-bridge/api-bridge.controller.ts`

```typescript
import { Controller, Post, Body, Get, Param, HttpCode } from '@nestjs/common';
import { ApiBridgeService } from './api-bridge.service';

@Controller('gate/bridge')
export class ApiBridgeController {
  constructor(private readonly apiBridgeService: ApiBridgeService) {}

  @Post('send-sms')
  @HttpCode(200)
  async sendSmsViaLegacy(
    @Body() request: { message: string; recipient: string; tenantId: string }
  ) {
    return this.apiBridgeService.routeSmsToLegacy(
      request.tenantId,
      request.recipient,
      request.message
    );
  }

  @Get('status/:tenantId')
  async getStatusForTenant(@Param('tenantId') tenantId: string) {
    return this.apiBridgeService.getStatus(tenantId);
  }
}
```

---

## 4️⃣ Integration Checklist

```markdown
## Week 1-2: Foundation Setup

- [ ] Create @app/config library
  - [ ] Export ConfigModule
  - [ ] Define all config schemas
  - [ ] Add to tsconfig.paths

- [ ] Create @app/tenant library
  - [ ] TenantService with AsyncLocalStorage
  - [ ] TenantInterceptor (HTTP + gRPC)
  - [ ] TenantContext interface
  - [ ] Export module

- [ ] Extend Database
  - [ ] Run multi-tenant-setup.sql
  - [ ] Verify shared_config schema created
  - [ ] Test create_new_tenant() function
  - [ ] Create first test tenant

- [ ] Update .env
  - [ ] Add GATE_DB_* variables
  - [ ] Add TENANT_STRATEGY (jwt|subdomain|header)
  - [ ] Add DEFAULT_TENANT for single-tenant fallback

- [ ] BFF Service Migration
  - [ ] Replace ConfigsModule with @app/config
  - [ ] Add TenantInterceptor to app.module
  - [ ] Update JWT creation to include tenant_id claim
  - [ ] Test: single request → tenant context resolves

- [ ] Test & Commit
  - [ ] All services start without error
  - [ ] Tenant context resolved correctly
  - [ ] No data leakage between requests
  - [ ] git commit -m "feat(multi-tenant): foundation setup"

## Week 3: Service Migration

- [ ] Create @app/cqrs library
  - [ ] BaseCommandHandler
  - [ ] BaseQueryHandler
  - [ ] Export both

- [ ] Migrate Core Service
  - [ ] Replace configs with @app/config ✓
  - [ ] Add TenantInterceptor ✓
  - [ ] Extend 5 CommandHandlers with BaseCommandHandler
  - [ ] Test command handlers receive tenantId
  - [ ] Test different tenants get different results

- [ ] Migrate DB Service
  - [ ] Add DynamicDataSource provider
  - [ ] Implement schema switching
  - [ ] Test: Query with x-tenant-id header uses correct schema

- [ ] Create Gate-Service
  - [ ] New project: npx @nestjs/cli new gate-service
  - [ ] Copy minimal structure
  - [ ] Add api-bridge module
  - [ ] Port 3003
  - [ ] Expose GET /health

- [ ] Test & Commit
  - [ ] Core service uses @app/cqrs
  - [ ] DB schema switching works
  - [ ] Gate-Service starts
  - [ ] git commit -m "refactor: migrate to shared libraries"

## Week 4: Customization

- [ ] Create @app/customization library
  - [ ] CustomizationConfig entity
  - [ ] CustomizationService
  - [ ] Caching layer (Redis)

- [ ] Implement Feature Flags
  - [ ] AuthResolver: check enableMFA feature
  - [ ] CommandService: check enableScheduling
  - [ ] SmsService: select provider per tenant

- [ ] Create Admin APIs
  - [ ] POST /gate/customization/{tenantId}
  - [ ] GET /gate/customization/{tenantId}
  - [ ] PUT /gate/customization/{tenantId}

- [ ] Test & Commit
  - [ ] Create 3 test tenants with different configs
  - [ ] Verify each tenant uses own config
  - [ ] Verify cache invalidation works
  - [ ] git commit -m "feat: per-tenant customization"

## Week 5-6: Integration Testing

- [ ] Multi-tenant E2E flow
  - [ ] Create 5 test tenants
  - [ ] User auth → command creation → notification
  - [ ] Verify data isolation (tenant A can't see tenant B data)

- [ ] Load Testing
  - [ ] 50 concurrent requests across 5 tenants
  - [ ] Monitor latency, memory, CPU
  - [ ] Verify all requests complete successfully

- [ ] Security Audit
  - [ ] Verify tenant isolation
  - [ ] Test data leakage scenarios
  - [ ] Verify rate limits per tenant

- [ ] Documentation
  - [ ] Update ARCHITECTURE.md with multi-tenant section
  - [ ] Create DEPLOYMENT.md for ops team
  - [ ] Create CUSTOMIZATION.md for admins

- [ ] Test & Commit
  - [ ] All tests pass
  - [ ] Documentation updated
  - [ ] git commit -m "docs: multi-tenant architecture"

## Week 7: Production Readiness

- [ ] Backup & Recovery
  - [ ] Test backup of single tenant schema
  - [ ] Test restore of single schema
  - [ ] Test point-in-time recovery

- [ ] Migration Scripts
  - [ ] Script: migrate existing single-tenant to multi-tenant
  - [ ] Script: create new tenant from CLI
  - [ ] Script: list all tenants & their schemas

- [ ] Staging Deployment
  - [ ] Deploy to staging environment
  - [ ] Run smoke tests
  - [ ] Monitor for 24 hours
  - [ ] Get sign-off from ops team

- [ ] Production Deployment Plan
  - [ ] Rollback procedure documented
  - [ ] Monitoring & alerting configured
  - [ ] On-call runbook prepared

- [ ] Final Approval
  - [ ] Tech lead review
  - [ ] Product owner sign-off
  - [ ] Ready for production rollout ✅
```

---

## 5️⃣ Example: Migration Jeden Tenant

```typescript
// Example: Migrate legacy user to new tenant

const tenantId = 'my-community-123';
const legacyUserId = 'old-system-456';

// 1. Create in Gate-Service
const response = await httpClient.post('/gate/migrate/user', {
  legacyUserId,
  targetTenant: tenantId,
  email: 'user@example.com',
  phone: '+48123456789',
});

// Response:
{
  gateUserId: 'uuid-xxx',
  tenantId: 'my-community-123',
  status: 'migrated',
  createdAt: '2026-04-13T10:00:00Z'
}

// 2. User now can login via new tenant with Open Gate

const loginResponse = await gql(`
  mutation {
    loginUser(email: "user@example.com", password: "...") {
      token
      user {
        id
        email
      }
    }
  }
`);

// 3. JWT token contains tenant info
const token = loginResponse.data.loginUser.token;
const decoded = jwtService.verify(token);

console.log(decoded);
// {
//   sub: 'uuid-xxx',
//   email: 'user@example.com',
//   tenant_id: 'my-community-123',
//   iat: 1712927100,
//   exp: 1712930700
// }

// 4. All subsequent requests use correct tenant context automatically
const commands = await gql(`
  query {
    commands {      # Only this tenant's commands
      id
      name
    }
  }
`);
```

---

*Last update: 2026-04-13*
