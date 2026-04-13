# TODO — open-gate

Lista zadań do poprawy odkrytych podczas analizy projektu.
Posortowane według priorytetu.

---

## Priorytet 1 — Krytyczny

- [ ] **Testy** — brak testów jednostkowych i e2e; tylko ~2 pliki spec z ~44 liniami kodu
  - Dodać testy serwisów, handlerów CQRS, guardów i interceptorów
  - Cel: pokrycie co najmniej 70%
- [x] **Plik `.env` w repozytorium** — klucze API (GROQ, OpenAI, Postman) są commitowane
  - ✅ Usunąć `.env` z git — `.env` nie jest trackowany (per .gitignore)
  - ✅ Dodać `.env.example` z placeholderami
  - ✅ `.env` dodany do `.gitignore` (już było)
- [x] **Backdoor w trybie deweloperskim** — `AuthGuard` przepuszcza wszystkie requesty gdy `DEV_MODE=true`
  - ✅ Usunięty bypass `process.env.DEV_MODE === 'true'` z `AuthGuard`
  - ✅ Dodane logowanie nieudanych prób dostępu
- [x] **Globalny filtr wyjątków** — brak `@Catch()`, odpowiedzi błędów są niespójne i mogą wyciekać dane
  - ✅ `GlobalExceptionFilter` już zaimplementowany w `src/libs/logger`
  - ✅ Zwraca ustandaryzowany format `{ statusCode, message, timestamp, path, method }`
  - ✅ Inne zachowanie dla production (minimalne info) vs dev (szczegóły)
- [x] **TypeScript strictness** — wyłączone kluczowe opcje
  - ✅ `noImplicitAny: true`, `strictBindCallApply: true`
  - ✅ Poprawione błędy typowania w `at-least-one-exist.decorator.ts` i `core-config.service.ts`

---

## Priorytet 2 — Wysoki

- [x] **Logowanie przez `console.*`** — 336 plików używa `console.log/error/warn`
  - ✅ Zastąpić przez `Logger` z NestJS z odpowiednimi poziomami (log/warn/error/debug)
- [x] **Brak obsługi transakcji** — operacje wieloetapowe w bazie bez transakcji
  - ✅ Dodane transakcje do `command.service.ts` (`create()`, `update()`)
  - ✅ Zmieniono `passkey.service.ts#setCounter` na atomic `update()`
  - ✅ Zmieniono `messages.service.ts#update` na atomic `update()`
  - ✅ Zmieniono `core-config.service.ts#updateConfig` na atomic `upsert()`
- [x] **Walidacja zmiennych środowiskowych** — brak schematu walidacji `.env`
  - ✅ Utworzony plik `src/config/env.validation.ts` z pełnym schematem Joi
  - ✅ 54 zmienne środowiskowe zwalidowane (porty, DB, Redis, API, auth, etc.)
  - ✅ Różne typy: string, number, port, email, URI, enum z `Joi`
  - ✅ Zintegrowano w ConfigModule.forRoot() wszystkich serwisów (bff, core, db, notify, redis)
  - ✅ Lepsze komunikaty błędów przy walidacji (abortEarly: false, allowUnknown: true)
- [x] **CSRF wyłączony** — `CsrfModule` i interceptor zakomentowane w `bff-service/app.module.ts`
  - ✅ `CsrfModule` i `APP_INTERCEPTOR` włączone w `app.module.ts`
  - ✅ Dodany resolver GraphQL `csrfToken` (query `{ csrfToken { csrfToken } }`) jako alternatywa dla REST
  - ✅ Naprawiony case nagłówka w `CsrfGuard` (`X-CSRF-Token` → `x-csrf-token`)
  - ✅ `CsrfInterceptor` wstrzykuje `CsrfGuard` przez DI zamiast `new CsrfGuard()`
  - ✅ Frontend (Apollo Client v4) pobiera token GraphQL i dołącza do każdej mutacji
- [x] **Health-check endpointy** — brak endpointów dla Docker healthcheck *(w trakcie)*
  - ✅ Dodać `GET /health` do bff-service, core-service, notify-service
  - ✅ Dodać `healthcheck:` do docker-compose.yaml dla serwisów aplikacyjnych

---

## Priorytet 3 — Średni

- [x] **Correlation ID** — brak ID korelacji między mikroserwisami (gRPC + HTTP)
  - ✅ `CorrelationService` (AsyncLocalStorage) — przechowuje ID w kontekście requesta
  - ✅ `CorrelationIdMiddleware` — odczytuje `X-Correlation-Id` z nagłówka lub generuje UUID; zapisuje do `req.correlationId` i ustawia nagłówek odpowiedzi
  - ✅ `Handler` (lib) — Proxy automatycznie wstrzykuje ID do `Metadata` każdego wywołania gRPC przez `@Optional() CORRELATION_SERVICE_TOKEN`
- [x] **Literówki w nazwach**
  - ✅ `front-servise` → `front-service` (katalog i referencje w config)
  - ✅ `hendler` → usunięty martwy wpis z `nest-cli.json` i `jest-e2e.json`
  - ✅ `outgoing.-notify.module.ts` → `outgoing-notify.module.ts`
- [x] **Brak `.env.example`** — nowi deweloperzy nie wiedzą jakich zmiennych potrzebują
  - ✅ Plik `.env.example` z placeholderami dla wszystkich 54+ zmiennych już istnieje
- [x] **Limity zasobów w Docker** — brak `mem_limit`, `cpus` w docker-compose
  - ✅ Dodane `mem_limit`, `mem_reservation`, `cpus` do wszystkich serwisów (bff/core/db/notify: 512/256m + 0.5 CPU; infra: 256/128m + 0.25 CPU)
- [x] **Connection pooling** — brak konfiguracji puli połączeń dla PostgreSQL i Redis
  - ✅ PostgreSQL (TypeORM `extra`): min/max connections, idle timeout, connection timeout; konfigurowane przez `POSTGRES_POOL_MIN/MAX`
  - ✅ Redis: `keepAlive` + `commandsQueueMaxLength` (konfigurowane przez `REDIS_QUEUE_MAX`); node-redis używa zalecanego wzorca single persistent connection z kolejkowaniem komend
- [x] **Brak graceful shutdown** — NestJS nie rejestruje `SIGTERM` / `SIGINT`
  - ✅ Dodane `app.enableShutdownHooks()` do `bff-service`, `core-service`, `notify-service`, `db-service`

---

## Priorytet 4 — Niski / Nice to have

- [x] **Rate limiting** — add limit per endpoint using `@nestjs/throttler`
  - ✅ ThrottlerModule configured in bff-service with 3 profiles: default (100/min), auth (5/min), public (30/min)
  - ✅ @Throttle decorators added to auth endpoints: login, passkey, MFA, QR code, CSRF
  - Endpoints protected with rate limiting now return 429 on quota exceeded
- [x] **Request/response logging middleware** — add HTTP request logging
  - ✅ RequestLoggingMiddleware logs incoming requests (method, path, query, IP, user-agent, userId)
  - ✅ Logs outgoing responses (status, duration, content-length)
  - ✅ Warns on errors, debug on success
- [x] **Rozmiar requestów** — add `body-parser` size limit (DOS protection)
  - ✅ Configured default 10mb limit, configurable via MAX_REQUEST_SIZE env
  - ✅ Applied to JSON and URL-encoded payloads
- [x] **GraphQL schema validation** — add SDL validation
  - ✅ GraphQLSchemaValidator checks schema file and validates SDL syntax
  - ✅ Validates on module initialization, logs type count
- [x] **Dokumentacja proto** — add comments to gRPC contracts
  - ✅ Added documentation to user.proto with RPC descriptions, enum values, field comments
  - ✅ command.proto already had documentation
- [x] **Circuit breaker** — add error handling for gRPC between services
  - ✅ GrpcCircuitBreaker implemented with CLOSED/OPEN/HALF_OPEN states
  - ✅ Integrated into Handler proxy layer for automatic tracking
  - ✅ Threshold: 5 failures to open, 2 successes to close, 60s timeout
- [x] **ADR (Architecture Decision Records)** — document architectural decisions
  - ✅ ARCHITECTURE.md created with 12 comprehensive ADRs
  - ✅ Documents decisions for microservices, GraphQL, gRPC, NestJS, logging, rate limiting, circuit breaker, correlation IDs, etc.

---

## TODO w kodzie (`// TODO` komentarze)

Znalezione w kodzie źródłowym — do implementacji lub przeniesienia do konfiguracji.

- [ ] **`command.service.ts:89`** — zaimplementować filtr akcji (`actionFilter`) używając `ArrayContains` lub query buildera
  - [`src/db-service/command/command.service.ts`](src/db-service/command/command.service.ts)
- [ ] **`admin.guard.ts:10`** — zaimplementować właściwą logikę sprawdzania admina (teraz tylko sprawdza czy user istnieje)
  - [`src/bff-service/common/guards/admin.guard.ts`](src/bff-service/common/guards/admin.guard.ts)
- [ ] **`get-prompt-by-id.handler.ts:16`** — dodać logikę cache dla promptów (odczyt/zapis po kluczu złożonym `key+command+userType` oraz po `id`)
  - [`src/bff-service/prompts/queries/handler/get-prompt-by-id.handler.ts`](src/bff-service/prompts/queries/handler/get-prompt-by-id.handler.ts)
- [ ] **`gate.service.ts:12,23`** — zaimplementować logikę otwierania i zamykania bramy
  - [`src/core-service/command/gate/gate.service.ts`](src/core-service/command/gate/gate.service.ts)
- [ ] **`soft-gate.service.ts:13`** — zaimplementować logikę otwierania bramy (soft-gate)
  - [`src/core-service/command/gate/soft-gate.service.ts`](src/core-service/command/gate/soft-gate.service.ts)
- [ ] **`groq.service.ts:25,50`** — dodać alarm w systemie monitorującym przy wyczerpaniu tokenów Groq API
  - [`src/core-service/process/services/groq.service.ts`](src/core-service/process/services/groq.service.ts)
- [ ] **`signal.attachment.ts:19`** — przenieść URL/konfigurację Signal do config service
  - [`src/notify-service/incoming/platforms/signal/signal.attachment.ts`](src/notify-service/incoming/platforms/signal/signal.attachment.ts)
- [ ] **`signal-sender.ts:14`** — przenieść URL/konfigurację Signal do config service
  - [`src/notify-service/outgoing/platforms/signal/signal-sender.ts`](src/notify-service/outgoing/platforms/signal/signal-sender.ts)

---

*Ostatnia aktualizacja: 2026-04-12*
