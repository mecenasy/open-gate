# Multi-Tenant Architecture Plan — Open Gate

**Data**: Kwiecień 2026  
**Status**: Fazy 1–4 + entities + dto + testy integracyjne + RUNBOOK ✅ ZREALIZOWANE  
**Cel**: Projekt jednego systemu dla wielu wspólnot z eliminacją duplikacji  

---

## 📋 Spis Treści

1. [Analiza Duplikacji](#analiza-duplikacji)
2. [Architektura Multi-Tenant](#architektura-multi-tenant)
3. [Specyfikacja Gate-Service](#specyfikacja-gate-service)
4. [Konsolidacja i Sharedowanie](#konsolidacja-i-sharedowanie)
5. [Customization per Community](#customization-per-community)
6. [Plan Migracji 8-tygodniowy](#plan-migracji-8-tygodniowy)

---

## Analiza Duplikacji

### 🔄 Duplikacje Znalezione

#### 1. **Configuration Management** (30-40% duplikacji)
```
DUPLIKACJA: Każdy serwis ma própny:
├── src/{service}/common/configs/configs.module.ts ← DUPLIKACJA
├── src/{service}/common/configs/configs.service.ts ← DUPLIKACJA
├── src/{service}/common/configs/types.config.service.ts ← DUPLIKACJA
└── .env & validation schema ← DUPLIKACJA

GDZIE:
├── BFF Service: src/bff-service/common/configs/
├── Core Service: src/core-service/common/configs/ (brakuje?)
├── Notify Service: brakuje wspólnego ConfigsModule
└── DB Service: src/db-service/common/configs/

ROZWIĄZANIE: Shared library @app/config
```

#### 2. **Authentication & Authorization** (25-35% duplikacji)
```
DUPLIKACJA: Logika auth rozmieszana:
├── BFF: src/bff-service/auth/ (MFA, OTP, TFA, Passkey) ← Onet
├── DB: src/db-service/auth/ (Login, Passkey) ← Duplikacja logiki  
├── BFF: src/bff-service/common/guards/user.guard.ts
├── BFF: src/bff-service/common/guards/admin.guard.ts  
└── BFF: src/bff-service/common/guards/csrf.guard.ts

GDZIE SIĘ POWTARZA:
- Weryfikacja JWT w BFF i DB
- Passkey handling w BFF i DB
- Admin checks / role validation
- CSRF validation

ROZWIĄZANIE: Shared library @app/auth
- AuthGuard, AdminGuard (move to lib)
- JWT utilities (move to lib)
- Passkey verification logic (centralize)
- Role checking (centralize)
```

#### 3. **CQRS Handler Pattern** (20-30% duplikacji)
```
DUPLIKACJA: Każdy handler re-implementuje:
├── Error handling pattern
├── Logging pattern
├── Tenant context resolution
├── Validation pattern
└── Authorization checks

GDZIE:
├── src/db-service/*/commands/handlers/*.ts (~15 handlers)
├── src/db-service/*/queries/handlers/*.ts (~10 handlers)
├── src/core-service/*/commands/handlers/*.ts (~12 handlers)  
└── src/bff-service/*/queries/handlers/*.ts (~8 handlers)

ROZWIĄZANIE: Base handler classes in @app/cqrs
```

#### 4. **Entity Models & Data Access** (15-20% duplikacja)

```
DUPLIKACJA:
├── User entity w DB Service
├── User validation w BFF Service
├── User DTOs w BFF i Core
└── User repository methods w DB

WZORZEC PO-DUPLIKACJI:
- TypeORM entity w DB service ← Centralne
- GraphQL types w BFF ← Duplikacja (OK, specyficzne dla GraphQL)
- DTOs w BFF ← Duplikacja (OK, API specifics)
- Repository w DB service ← Centralne

ROZWIĄZANIE: Move core entities to shared @app/entities
```

#### 5. **Error Handling & Exception Mapping** (10-15% duplikacji)
```
DUPLIKACJA:
├── GlobalExceptionFilter w BFF (src/libs/logger)
├── GlobalExceptionFilter w Core (src/libs/logger)
├── GlobalExceptionFilter w Notify (src/libs/logger)
└── Custom exception types w każdym serwisie

PROBLEM: 3 kopie tego samego filtru zamiast 1 wspólnego

ROZWIĄZANIE: Already in @app/logger ✅ (tylko optimize)
```

#### 6. **Event Publishing & Handling** (10% duplikacji)
```
DUPLIKACJA:
├── EventService w Core: src/core-service/common/
├── EventService w BFF: (lite version)
└── Similar event types defined across services

ROZWIĄZANIE: Consolidate in @app/event (ale już częściowo done)
```

#### 7. **Response DTOs & GraphQL Types** (5-10% duplikacja)
```
DUPLIKACJA:
├── CommandType w BFF src/bff-service/command/dto/
├── Command entity w DB src/db-service/command/entity/
├── Command DTO w Core (?)

NOTATKA: Duplikacja jest OK (GraphQL != REST != DB)
- GraphQL types specyficzne dla frontend API
- DTOs dla GRPC communication
- Entities dla database
```

---

## 🏗️ Architektura Multi-Tenant

### Warstwa Tenant Context

```typescript
// CONTEXT: Tenant resolution z różnych źródeł
// Shared lib: @app/tenant

export interface TenantContext {
  tenantId: string;           // UUID wspólnoty
  tenantSlug: string;         // community-name (URL friendly)
  schemaName: string;         // public_{tenantId} (PostgreSQL schema)
  customizationId?: string;   // Reference do customization config
  correlationId: string;      // Z CorrelationService
  userId?: string;            // Optional, jeśli zalogowany
}

// AsyncLocalStorage pattern
export class TenantService {
  async getTenantContext(): Promise<TenantContext> { }
  async setTenantContext(context: TenantContext): void { }
}
```

### Resolucja Tenant-a

```
TenantResolution Priority:
1. JWT claim `tenant_id` ← PREFERRED (zalogowany user)
2. Subdomain: {tenant}.app.com → lookup in central DB ← 2nd option
3. Header: X-Tenant-Id ← 3rd (internal service-to-service)
4. Database connection default (fallback single-tenant)

IMPLEMENTACJA:
├── BFF: TenantInterceptor (sprawdza JWT, subdomain, header)
├── Core: TenantInterceptor (rozpoznaje z gRPC metadata)
└── DB: Dynamic schema selection (based on X-Tenant-Id header)
```

### Database Strategy — Separate Schemas

```sql
-- PostgreSQL: Jedna baza, wiele schematów per tenant

CREATE SCHEMA public_xxxxxxxx;  -- Tenant 1
CREATE SCHEMA public_yyyyyyyy;  -- Tenant 2
CREATE SCHEMA shared_config;    -- Shared data across all tenants

-- Shared tables (single instance):
CREATE TABLE shared_config.tenants (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  customization_id UUID,
  schema_name TEXT,
  created_at TIMESTAMP
);

-- Tenant-specific tables (in public_xxxxxxxx schema):
CREATE TABLE users (...);        -- Each tenant has own users
CREATE TABLE commands (...);
CREATE TABLE prompts (...);
-- etc.
```

### TypeORM Dynamic DataSource

```typescript
// lib: @app/database

export class DynamicDataSourceProvider {
  async getDataSource(tenantId: string): Promise<DataSource> {
    // Returns DataSource configured for tenant's schema
    // Caches DataSources per tenant
  }
  
  async executeInTenantContext<T>(
    tenantId: string,
    fn: (em: EntityManager) => Promise<T>
  ): Promise<T> {
    // Executes query in tenant's schema
  }
}
```

### gRPC Metadata for Tenant

```typescript
// Tenant passed via gRPC metadata:

// BFF → Core (gRPC)
const call = coreService.SomeRpc(request, {
  metadata: new Metadata()
    .add('x-tenant-id', tenantId)
    .add('x-correlation-id', correlationId)
    .add('x-user-id', userId)
});

// Core receives in interceptor:
async intercept(call, handler) {
  const tenantId = call.metadata.get('x-tenant-id')[0];
  await this.tenantService.setTenantContext({ tenantId, ... });
  return handler();
}
```

---

## 🌉 Specyfikacja Gate-Service

### Rola Gate-Service

Gate-service jest **ADAPTERM** między:
- ✅ **Existing Infrastructure** (legacy systemy, istniejące API)
- ✅ **Open Gate System** (nowy multi-tenant system)

Gate-service NIE zmienia logikę biznesową — tylko **mapuje i transformuje**.

### Architektura Gate-Service

```
External Systems                Gate-Service (Port 3003)
     │                                  │
├─→ Legacy API          ──────→ API Bridge Module
├─→ Old DB              ──────→ DB Adapter Module  
├─→ SMS Provider        ──────→ SMS Router Module
└─→ Other Services      ──────→ Orchestration Layer
                                      │
                          gRPC :50053 ↓
                        ┌─────────────────────┐
                        │ Open Gate System    │
                        │ (Core, Notify, etc) │
                        └─────────────────────┘
```

### Gate-Service Modules

```
src/gate-service/
├── main.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
│
├── api-bridge/                   # REST ↔ gRPC adapter
│   ├── api-bridge.module.ts
│   ├── api-bridge.controller.ts
│   ├── api-bridge.service.ts
│   └── transformers/
│       ├── request.transformer.ts
│       └── response.transformer.ts
│
├── db-adapter/                   # Legacy DB ↔ New schema adapter
│   ├── db-adapter.module.ts
│   ├── db-adapter.service.ts
│   ├── legacy-connection.ts
│   └── data-mapper/
│       ├── user.mapper.ts
│       ├── command.mapper.ts
│       └── message.mapper.ts
│
├── sms-router/                   # Multi-provider SMS routing
│   ├── sms-router.module.ts
│   ├── sms-router.service.ts
│   └── providers/
│       ├── twilio.provider.ts
│       ├── legacy-sms.provider.ts
│       └── provider.interface.ts
│
├── orchestration/                # Complex workflow handling
│   ├── orchestration.module.ts
│   ├── workflow.service.ts
│   └── saga-handlers/
│       ├── user-migration.saga.ts
│       └── command-sync.saga.ts
│
└── common/
    ├── tenant-mapper/
    │   ├── tenant-mapper.service.ts  # Maps legacy system ID → tenant UUID
    │   └── mapping-table.entity.ts
    └── guards/
        └── gate.guard.ts             # Custom auth for incoming calls
```

### Gate-Service Endpoints

```typescript
// REST API exposed by Gate-Service (port 3003)

// ====== Migration & Sync Endpoints ======

POST /gate/migrate/user
Body: { legacyUserId, newTenant }
Response: { gateId, userId, status }

POST /gate/sync/commands
Body: { tenantId, since: Date }
Response: { synced: number }

// ====== Bridge Endpoints ======

POST /gate/bridge/send-sms
Body: { message, recipient, tenantId }
Response: { messageId, provider, status }

POST /gate/bridge/fetch-history
Body: { tenantId, userId, type }
Response: { items: [...] }

// ====== Health & Status ======

GET /gate/health
GET /gate/status
GET /gate/mappings/{tenantId}
```

### Gate-Service Data Models

```typescript
// Mapping between legacy and new system

@Entity()
export class TenantMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  legacySystemId: string;        // ID z legacy systemu
  
  @Column()
  gateUuid: string;              // Open Gate tenant ID
  
  @Column()
  status: 'pending' | 'mapped' | 'migrated' | 'active';
  
  @Column({ nullable: true })
  customizationId: string;       // Link do customization per tenant
  
  @Column()
  createdAt: Date;
  
  @Column({ nullable: true })
  migratedAt: Date;
}

@Entity()
export class UserMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  legacyUserId: string;
  
  @Column()
  gateUserId: string;
  
  @Column()
  tenantId: string;
  
  @Column()
  status: 'pending' | 'mapped' | 'active';
}

@Entity()
export class CustomizationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  tenantId: string;
  
  @Column('jsonb')
  config: {
    smsProvider: 'twilio' | 'legacy' | 'custom';
    commandProcessingDelay?: number;
    customPromptLibrary?: boolean;
    features: string[];          // Feature flags per tenant
    branding?: {
      logo?: string;
      colors?: Record<string, string>;
    };
  };
  
  @Column()
  createdAt: Date;
  
  @Column()
  updatedAt: Date;
}
```

### Gate-Service gRPC Interface

```protobuf
// proto/gate.proto

package gate;

service GateService {
  // Migrate user from legacy system
  rpc MigrateUser (MigrateUserRequest) returns (MigrateUserResponse);
  
  // Sync data bidirectionally
  rpc SyncCommands (SyncRequest) returns (SyncResponse);
  rpc SyncMessages (SyncRequest) returns (SyncResponse);
  
  // Routing & transformation
  rpc TransformAndRoute (TransformRequest) returns (TransformResponse);
  
  // Status & mapping
  rpc GetTenantMapping (TenantMappingRequest) returns (TenantMappingResponse);
  rpc GetUserMapping (UserMappingRequest) returns (UserMappingResponse);
}

message MigrateUserRequest {
  string legacy_user_id = 1;
  string target_tenant_id = 2;
  string email = 3;
  string phone = 4;
}

message MigrateUserResponse {
  string gate_user_id = 1;
  string tenant_id = 2;
  string status = 3;
}

message GetCustomizationRequest {
  string tenant_id = 1;
}

message CustomizationResponse {
  string tenant_id = 1;
  map<string, string> config = 2;
}
```

---

## 🔀 Konsolidacja i Sharedowanie

### Shared Library Structure (`src/libs/`)

#### ✅ Już Istniejące

```text
@app/logger       — Logger library ✅
@app/db-grpc      — Database gRPC client & server ✅
@app/notify-grpc  — Notify gRPC client & server ✅
@app/gate-grpc    — Gate gRPC client & server ✅
@app/redis        — Redis & queue module ✅
@app/event        — Event publishing system ✅
@app/handler      — gRPC Handler proxy + circuit breaker ✅
```

#### ✅ Zrealizowane (2026-04-13)

```
@app/config ✅ DONE
├── typed-config.service.ts     ← TypedConfigService<T> base — eliminuje duplikację
└── index.ts
EFEKT: BFF / Core / DB-service TypeConfigService extend z @app/config zamiast
       bezpośrednio z @nestjs/config. Usunięto 3 × identyczny boilerplate.

@app/auth ✅ DONE
├── guards/
│   ├── auth.guard.ts           ← przeniesiony z bff-service/common/guards/user.guard.ts
│   ├── admin.guard.ts          ← przeniesiony z bff-service/common/guards/admin.guard.ts
│   └── csrf.guard.ts           ← przeniesiony z bff-service/common/guards/csrf.guard.ts
├── decorators/
│   ├── public.decorator.ts     ← @Public() + IS_PUBLIC_KEY
│   ├── csrf.decorator.ts       ← @ExcludeCsrf(), @UseCsrf()
│   ├── current-user-id.decorator.ts
│   └── current-user-gpl.decorator.ts
├── types/
│   └── context.ts              ← GraphQL Context interface
├── helpers/
│   └── get-user.ts             ← getUser() helper
└── index.ts
EFEKT: 14 plików w BFF zaktualizowanych — importują z @app/auth.
       Usunięto lokalne kopie guardów i dekoratorów.
       Pozostało w BFF: OwnerGuard (zależy od UserStatusType), @Owner, @SecurityContext.

@app/exceptions — CZĘŚCIOWO ZREALIZOWANE ✅
  GlobalExceptionFilter w bff-service/common/filters/ był martwym duplikatem.
  Usunięto go — BFF już używał wersji z @app/logger w main.ts.
  filters/index.ts re-eksportuje teraz GlobalExceptionFilter z @app/logger.
```

#### ✅ Zrealizowane (2026-04-13 — 2026-04-14)

```text
@app/tenant ✅ DONE
├── tenant.module.ts
├── tenant.service.ts           (AsyncLocalStorage — izolacja per request)
├── interceptors/
│   └── tenant.interceptor.ts   (HTTP/GraphQL: session → subdomain → header)
├── decorators/
│   └── current-tenant.decorator.ts
├── types/
│   └── tenant.types.ts
└── tenant.service.integration.spec.ts  ← testy izolacji ALS

@app/cqrs ✅ DONE
├── base/
│   ├── base-command.handler.ts ← 44 handlery db-service zmigrowane, ~440 linii boilerplate usunięto
│   └── base-query.handler.ts
└── index.ts

@app/database ✅ DONE
├── database.module.ts
├── dynamic-data-source.provider.ts  ← per-tenant DataSource cache + search_path
├── tenant-schema.manager.ts         ← CREATE SCHEMA IF NOT EXISTS
├── dynamic-data-source.provider.spec.ts  ← testy cache, izolacji, destroy
└── tenant-schema.manager.spec.ts         ← testy provisioning, SQL injection

@app/customization ✅ DONE
├── customization.types.ts      ← CommunityCustomization interface + DEFAULT_CUSTOMIZATION
└── index.ts
EFEKT: FeatureFlagGuard w BFF, TenantCustomizationService w BFF+Core,
       SofDispatcher (core) z per-tenant timeout.

@app/entities ✅ DONE (2026-04-14)
├── enums/
│   ├── user-type.enum.ts       ← UserType (owner/admin/super_user/member/user)
│   ├── user-status.enum.ts     ← UserStatus (pending/active/suspended/banned)
│   ├── risk-reason.enum.ts     ← RiskReason + RiskWeight + RiskScoreMapping
│   ├── risk-tolerance.enum.ts  ← RiskToleranceLevel
│   ├── config-type.enum.ts     ← ConfigType + ConfigSubType
│   └── message-type.enum.ts    ← MessageType
├── user/
│   ├── user.entity.ts
│   ├── user-role.entity.ts
│   ├── user-settings.entity.ts
│   ├── password.entity.ts
│   └── history.entity.ts
├── auth/passkey.entity.ts
├── command/command.entity.ts
├── messages/messages.entity.ts
├── prompt/prompt.entity.ts
├── config/config.entity.ts
├── tenant/tenant.entity.ts
├── tenant/customization-config.entity.ts
└── index.ts
EFEKT: db-service entity files → cienkie re-eksporty z @app/entities.
       src/types/risk-reason.ts + user/user-type.ts + user/status.ts → re-eksporty.
       core-config/entity/types.ts → re-export.

@app/dto ✅ DONE (2026-04-14)
├── pagination/
│   ├── pagination-query.dto.ts ← page + limit + get skip()
│   └── list-response.dto.ts    ← data + total + totalPages + hasNextPage + ListResponseDto.from()
└── index.ts
```

#### 🆕 Pozostało do zrealizowania

```text
@app/auth — ROZSZERZYC
└── utils/
    ├── jwt.utils.ts            (centralizacja logiki JWT z BFF i DB)
    ├── passkey.utils.ts        (centralizacja Passkey z BFF i DB)
    └── tenant.guard.ts         (guard sprawdzajacy is_active tenanta)

Gate-Service (src/gate-service/)  ← GLOWNY BRAKUJACY ELEMENT
├── api-bridge/                 (REST <-> gRPC adapter)
├── db-adapter/                 (legacy DB <-> new schema)
├── sms-router/                 (multi-provider SMS)
├── orchestration/              (saga handlers: user-migration, command-sync)
└── common/tenant-mapper/       (TenantMapping, UserMapping entities)
```

### Migration Path: Config Consolidation

```
PHASE 1 (Week 1): Create @app/config
├── Create config.module.ts (same as bff-service version)
├── Create config.service.ts with all schemas
├── Export from package
└── Update ts-config paths

PHASE 2 (Week 1-2): Migrate BFF
├── Replace configs.module → @app/config
├── Replace TypeConfigService → ConfigService
├── Test & validate
└── Commit

PHASE 3 (Week 2): Migrate Core
├── Create src/core-service/common/configs if needed
├── Replace with @app/config
├── Validate gRPC still works
└── Commit

PHASE 4 (Week 2-3): Migrate Notify & DB
├── Replace each service's configs with shared
└── Validate all services start

RESULT: 3 different config setups → 1 shared library ✅
SAVINGS: ~600 lines of duplicated code removed
```

---

## 🎨 Customization per Community

### Customization Config Structure

```typescript
// lib: @app/customization

export interface CommunityCustomization {
  id: string;
  tenantId: string;
  
  // Branding
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontSize?: 'small' | 'normal' | 'large';
  };
  
  // Feature Flags
  features: {
    enableMFA: boolean;
    enablePasskey: boolean;
    enableSignal: boolean;
    enableWhatsApp: boolean;
    enableCommandScheduling: boolean;
    enableAnalytics: boolean;
    maxUsersPerTenant: number;
  };
  
  // Message Routing
  messaging: {
    defaultSmsProvider: 'twilio' | 'legacy' | 'africastalking';
    priorityChannels: ('sms' | 'signal' | 'email' | 'whatsapp')[];
    rateLimitPerMinute: number;
  };
  
  // Command Processing
  commands: {
    timeout: number;                  // ms
    maxRetries: number;
    processingDelay: number;          // ms
    customPromptLibraryEnabled: boolean;
  };
  
  // Compliance & Business Rules
  compliance: {
    dataResidency: string;            // 'EU' | 'US' | 'APAC'
    encryptionEnabled: boolean;
    // Custom webhook for logs
    webhookUrl?: string;
  };
  
  // Custom Fields
  custom: Record<string, unknown>;   // For tenant-specific extensions
}
```

### Customization Delivery Strategy

#### Option A: Database-Driven (RECOMMENDED)
```typescript
// Customization loaded from DB on request

@Injectable()
export class CustomizationService {
  async getCustomization(tenantId: string): Promise<CommunityCustomization> {
    // 1. Check Redis cache
    const cached = await this.cache.get(`customization:${tenantId}`);
    if (cached) return cached;
    
    // 2. Load from DB
    const config = await this.customizationRepo.findOne({ tenantId });
    
    // 3. Cache for 1 hour
    await this.cache.set(`customization:${tenantId}`, config, 3600);
    
    return config || this.getDefaults();
  }
  
  async updateCustomization(
    tenantId: string,
    config: Partial<CommunityCustomization>
  ): Promise<void> {
    await this.customizationRepo.update({ tenantId }, config);
    
    // Invalidate cache
    await this.cache.delete(`customization:${tenantId}`);
    
    // Emit event for other services
    this.eventEmitter.emit('community.customization.updated', { tenantId, config });
  }
}

// Usage:
@Injectable()
export class CommandService {
  async processCommand(request: ProcessCommandRequest): Promise<void> {
    const customization = await this.customizationService.getCustomization(
      request.tenantId
    );
    
    const timeout = customization.commands.timeout ?? 30000;
    const maxRetries = customization.commands.maxRetries ?? 3;
    
    // Process with tenant-specific rules...
  }
}
```

#### Option B: Decorator-Based
```typescript
// Use decorator for automatic customization resolution

@Injectable()
export class CustomizationInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantContext?.tenantId;
    
    request.customization = await this.customizationService.getCustomization(
      tenantId
    );
    
    return next.handle();
  }
}

// Usage in resolver:
@Resolver()
export class CommandResolver {
  @Mutation()
  async createCommand(
    @Args() input: CreateCommandInput,
    @Inject(CUSTOMIZATION_TOKEN) customization: CommunityCustomization
  ) {
    // customization automatically injected
    const timeout = customization.commands.timeout;
  }
}
```

#### Option C: Config Server Pattern
```typescript
// Microservice dedicated to serving customizations

// Gate-Service exposes:
GET /customization/{tenantId}
Response: { id, features, branding, messaging, ... }

// Other services call:
@Injectable()
export class CustomizationClient {
  async getCustomization(tenantId: string): Promise<CommunityCustomization> {
    return this.httpClient.get(
      `${this.configServerUrl}/customization/${tenantId}`
    ).toPromise();
  }
}
```

### Per-Community Feature Flags Example

```typescript
// Usage across services:

// BFF: Feature flag in GraphQL schema
@Resolver()
export class AuthResolver {
  @Mutation()
  async requestMfa(@Inject(CUSTOMIZATION_TOKEN) custom): Promise<boolean> {
    if (!custom.features.enableMFA) {
      throw new Error('MFA is not enabled for this community');
    }
    // Process MFA...
  }
}

// Core: Command processing with custom rules
@CommandHandler(ProcessCommandCommand)
export class ProcessCommandHandler {
  async execute(command: ProcessCommandCommand): Promise<void> {
    const custom = await this.customizationService.get(command.tenantId);
    
    // Apply tenant-specific timeout
    await this.timeout(
      this.executeCommand(command),
      custom.commands.timeout
    );
    
    // Respect rate limits
    if (await this.rateLimitExceeded(command.tenantId, custom.messaging.rateLimitPerMinute)) {
      throw new RateLimitExceeded();
    }
  }
}

// Notify: SMS provider selection
@Injectable()
export class SmsService {
  async send(message: SendSmsRequest): Promise<void> {
    const custom = await this.customizationService.get(message.tenantId);
    
    const provider = custom.messaging.defaultSmsProvider;
    
    if (provider === 'twilio') {
      return this.twilioProvider.send(message);
    } else if (provider === 'legacy') {
      return this.legacySmsProvider.send(message);
    }
  }
}
```

---

## 📅 Plan Migracji 8-tygodniowy

### Tydzień 1-2: Foundation

```
TYDZIEŃ 1:
┌─ Poniedziałek-Wtorek
│  ├─ Create @app/config library
│  ├─ Create @app/tenant library (AsyncLocalStorage)
│  └─ Create @app/customization library
│
├─ Środa-Czwartek
│  ├─ Extend DB schema: add tenants table, customization_config table
│  ├─ Create TypeORM DynamicDataSourceProvider
│  └─ Create TenantInterceptor for BFF & Core
│
└─ Piątek
   ├─ Test tenant resolution (JWT → tenant context)
   ├─ Test schema switching (same tenant, diff requests)
   └─ Code review & fix issues
```

```
TYDZIEŃ 2:
┌─ Poniedziałek-Wtorek
│  ├─ Migrate BFF: replace local configs with @app/config
│  ├─ Migrate BFF: add @app/auth library (move guards)
│  └─ Migrate BFF: add TenantInterceptor
│
├─ Środa
│  ├─ Test BFF: single-tenant flow still works
│  ├─ Test BFF: multi-tenant flow with header/JWT
│  └─ Fix gRPC calls to include tenant metadata
│
├��� Czwartek
│  ├─ Create @app/cqrs base handler classes
│  └─ Start migrating command handlers (5-10 samples)
│
└─ Piątek
   ├─ Review, test, commit
   └─ Sprint retrospective
```

### Tydzień 3-4: Service Migration

```
TYDZIEŃ 3:
┌─ Poniedziałek-Wtorek
│  ├─ Migrate Core Service config to @app/config
│  ├─ Add TenantInterceptor to Core
│  └─ Test Core gRPC receives tenant metadata
│
├─ Środa-Czwartek
│  ├─ Migrate all command handlers to @app/cqrs base class
│  ├─ Migrate all query handlers to @app/cqrs base class
│  └─ Test handler tests pass
│
└─ Piątek
   ├─ Code review all migrations
   ├─ Commit: refactor(core): migrate to shared @app/cqrs
   └─ Performance verify (latency, memory)
```

```
TYDZIEŃ 4:
┌─ Poniedziałek-Wtorek
│  ├─ Migrate Notify Service config
│  ├─ Add TenantInterceptor to Notify
│  └─ Update gRPC proto for tenant metadata
│
├─ Środa
│  ├─ Migrate DB Service (schema selection, dynamic ORM)
│  ├─ Test: different tenants, different schemas
│  └─ Test: shared vs tenant-specific tables
│
├─ Czwartek
│  ├─ Create Gate-Service from scratch (port 3003)
│  ├─ Implement: TenantMapping, UserMapping entities
│  ├─ Implement: API bridge module
│  └─ Implement: gRPC interface
│
└─ Piątek
   ├─ E2E test: legacy system → gate → open gate flow
   └─ Commit all service migrations
```

### Tydzień 5-6: Customization & Feature Flags

```
TYDZIEŃ 5:
┌─ Poniedziałek-Wtorek
│  ├─ Create @app/customization library (full structure)
│  ├─ Create CustomizationConfig entity & repository
│  └─ Create CustomizationService (with caching)
│
├─ Środa
│  ├─ Add customization endpoints to Gate-Service
│  ├─ Create UI for customization management (admin panel)
│  └─ Test: update customization → cache invalidation → new behavior
│
├─ Czwartek
│  ├─ Implement feature flags in each service
│  │  ├─ BFF: auth features (MFA, Passkey)
│  │  ├─ Core: command features (scheduling, retry logic)
│  │  └─ Notify: channel selection (SMS provider)
│  └─ Test: enable/disable features per tenant
│
└─ Piątek
   ├─ E2E tests: 3 different tenants, different features
   └─ Demo to stakeholders
```

```
TYDZIEŃ 6:
┌─ Poniedziałek-Wtorek
│  ├─ Implement per-tenant customization in Core
│  │  ├─ ProcessCommand uses customization timeout
│  │  ├─ RateLimit uses customization limit
│  │  └─ Prompt cache per customization
│  └─ Test: 2 tenants, different timeouts → both work
│
├─ Środa-Czwartek
│  ├─ Implement per-tenant customization in Notify
│  │  ├─ SMS provider selection per tenant
│  │  ├─ Channel priority per tenant
│  │  └─ Rate limiting per tenant
│  └─ E2E: 3 tenants with different SMS providers
│
└─ Piątek
   ├─ Load test: 10 tenants, different custom configs
   ├─ Fix bottlenecks (caching, query optimization)
   └─ Sprint wrap-up
```

### Tydzień 7: Integration & Testing

```
TYDZIEŃ 7:
┌─ Poniedziałek-Wtorek
│  ├─ Integration tests: all services communicate correctly
│  ├─ Multi-tenant e2e: auth → command → notify workflow
│  ├─ Data isolation tests (tenant A can't see tenant B data)
│  └─ Performance tests (response time per tenant)
│
├─ Środa
│  ├─ Create migration scripts
│  │  ├─ Initialize tenant in DB
│  │  ├─ Create schema
│  │  ├─ Apply base migrations
│  │  └─ Create default customization
│  └─ Test scripts
│
├─ Czwartek
│  ├─ Documentation update
│  │  ├─ Multi-tenant architecture (update ARCHITECTURE.md)
│  │  ├─ Adding new tenant (RUNBOOK.md)
│  │  ├─ Customization guide
│  │  └─ Gate-Service integration guide
│  └─ README updates
│
└─ Piątek
   ├─ Final integration test
   ├─ Security audit (data isolation, auth)
   └─ Commit: docs(multi-tenant): complete architecture & runbooks
```

### Tydzień 8: Stabilization & Deployment

```
TYDZIEŃ 8:
┌─ Poniedziałek-Wtorek
│  ├─ Load testing: 50+ concurrent tenants
│  ├─ Chaos testing: service failures, network partitions
│  ├─ Fix any stability issues
│  └─ Performance optimization (caching, indexing)
│
├─ Środa
│  ├─ Staging deployment prep
│  ├─ Backup & restore strategy (per-tenant)
│  ├─ Disaster recovery plan
│  └─ Runbooks for ops team
│
├─ Czwartek-Piątek
│  ├─ Pilot deployment: 1 test tenant
│  ├─ Monitor for 24 hours
│  ├─ Feedback & final fixes
│  └─ Ready for production roll-out
```

---

## 📊 Summary: Before vs After

### Duplikacja Kodu

```
PRZED:
├── Configuration: 3 × ~200 lines = 600 lines duplikacji  ❌
├── Auth guards: 3 × ~50 lines = 150 lines duplikacji    ❌
├── Exception filters: 3 × ~100 lines = 300 lines duplik. ❌
├── CQRS Handlers: ~40 handlers × avg 50 lines = repetitive pattern  ❌
└── TOTAL: ~1000+ lines duplikacji, inconsistency, maintenance nightmare

PO:
├── Configuration: 1 × @app/config, used by all services ✅
├── Auth guards: 1 × @app/auth, imported everywhere   ✅
├── Exception handling: 1 × optimized in @app/exceptions ✅
├── CQRS: Base classes in @app/cqrs, handlers extend  ✅
└── TOTAL: ~600 lines removed, DRY principle, consistent patterns
```

### Multi-Tenancy Support

```
PRZED:
└── Single tenant only ❌

PO:
├── Tenant resolution (JWT, subdomain, header) ✅
├── Separate schemas per tenant (PostgreSQL) ✅
├── Dynamic DataSource per tenant ✅
├── gRPC metadata propagation ✅
├── Complete data isolation ✅
└── Ready for 1000+ tenants ✅
```

### Customization Capability

```
PRZED:
└── No customization, same rules for everyone ❌

PO:
├── Per-tenant branding ✅
├── Per-tenant feature flags ✅
├── Per-tenant SMS provider selection ✅
├── Per-tenant limits & timeouts ✅
├── Per-tenant compliance settings ✅
└── Admin UI for managing customization ✅
```

### New Services

```
NOWE:
├── Gate-Service (port 3003) ✅
│   ├─ API Bridge to legacy systems
│   ├─ Database adapter layer
│   ├─ SMS routing
│   └─ Migration orchestration
├── Customization Config Service (built-in) ✅
└── Tenant Management Service (admin API) ✅
```

---

## 🎯 Success Criteria

- ✅ All services use shared libraries (@app/config, @app/auth, @app/tenant)
- ✅ Zero code duplication for auth, config, exception handling
- ✅ New tenant can be created in < 5 minutes (via Gate-Service API)
- ✅ Data isolation: tenant A queries never return tenant B data
- ✅ Per-tenant customization: features, branding, limits working
- ✅ Gate-Service: successfully bridges legacy system with Open Gate
- ✅ Multi-tenant e2e flow: auth → command → notify works for 5+ concurrent tenants
- ✅ Performance: < 200ms latency per request (same as single-tenant)
- ✅ All services pass security audit (data isolation, auth, rate limiting)

---

## 📝 Next Steps

1. **Immediate** (This week):
   - Review this plan with team
   - Finalize shared library priorities
   - Start Week 1: create @app/config, @app/tenant

2. **Short-term** (Week 1-2):
   - Complete foundation libraries
   - Extend DB schema for tenants
   - Implement TenantInterceptor

3. **Medium-term** (Week 3-6):
   - Migrate all services to shared libraries
   - Implement Gate-Service
   - Add customization system

4. **Long-term** (Week 7-8):
   - Comprehensive testing & load testing
   - Documentation & runbooks
   - Pilot deployment

---

*Ostatnia aktualizacja: 2026-04-13*
