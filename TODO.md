# TODO — open-gate

Lista zadań do poprawy odkrytych podczas analizy projektu.
Posortowane według priorytetu.

---

## Priorytet 1 — Krytyczny

- [ ] **Testy** — brak testów jednostkowych i e2e; tylko ~2 pliki spec z ~44 liniami kodu
  - Dodać testy serwisów, handlerów CQRS, guardów i interceptorów
  - Cel: pokrycie co najmniej 70%
- [ ] **Plik `.env` w repozytorium** — klucze API (GROQ, OpenAI, Postman) są commitowane
  - Usunąć `.env` z git (`git rm --cached .env`)
  - Dodać `.env.example` z placeholderami
  - Dodać `.env` do `.gitignore`
- [ ] **Backdoor w trybie deweloperskim** — `AuthGuard` przepuszcza wszystkie requesty gdy `DEV_MODE=true`
  - Usunąć lub ograniczyć wyłącznie do środowiska lokalnego z jawnym ostrzeżeniem
- [ ] **Globalny filtr wyjątków** — brak `@Catch()`, odpowiedzi błędów są niespójne i mogą wyciekać dane
  - Zaimplementować `GlobalExceptionFilter` zwracający ustandaryzowany format `{ statusCode, message, timestamp }`
- [x] **TypeScript strictness** — wyłączone kluczowe opcje
  - Włączyć `noImplicitAny: true`, `strictBindCallApply: true`
  - Zmienić `@typescript-eslint/no-explicit-any` na `error`

---

## Priorytet 2 — Wysoki

- [ ] **Logowanie przez `console.*`** — 336 plików używa `console.log/error/warn`
  - Zastąpić przez `Logger` z NestJS z odpowiednimi poziomami (log/warn/error/debug)
- [ ] **Brak obsługi transakcji** — operacje wieloetapowe w bazie bez transakcji
  - Dodać wzorzec transakcji TypeORM (`EntityManager.transaction`)
- [ ] **Walidacja zmiennych środowiskowych** — brak schematu walidacji `.env`
  - Użyć `Joi` lub `class-validator` w `ConfigModule.forRoot({ validationSchema })`
- [ ] **CSRF wyłączony** — `CsrfModule` i interceptor zakomentowane w `bff-service/app.module.ts`
  - Włączyć i przetestować
- [ ] **Health-check endpointy** — brak endpointów dla Docker healthcheck *(w trakcie)*
  - ✅ Dodać `GET /health` do bff-service, core-service, notify-service
  - ✅ Dodać `healthcheck:` do docker-compose.yaml dla serwisów aplikacyjnych

---

## Priorytet 3 — Średni

- [ ] **Correlation ID** — brak ID korelacji między mikroserwisami (gRPC + HTTP)
  - Dodać middleware generujący `X-Correlation-ID` i przekazujący go przez gRPC metadata
- [ ] **Literówki w nazwach** *(w trakcie)*
  - ✅ `front-servise` → `front-service` (katalog i referencje)
  - ✅ `hendler` → usunąć martwy wpis z `nest-cli.json` i `jest-e2e.json`
  - ✅ `outgoing.-notify.module.ts` → `outgoing-notify.module.ts`
- [ ] **Brak `.env.example`** — nowi deweloperzy nie wiedzą jakich zmiennych potrzebują
- [ ] **Limity zasobów w Docker** — brak `mem_limit`, `cpus` w docker-compose
- [ ] **Connection pooling** — brak konfiguracji puli połączeń dla PostgreSQL i Redis
- [ ] **Brak graceful shutdown** — NestJS nie rejestruje `SIGTERM` / `SIGINT`
  - Dodać `app.enableShutdownHooks()` do każdego `main.ts`

---

## Priorytet 4 — Niski / Nice to have

- [ ] **Rate limiting** — brak limitu zapytań per endpoint
  - Użyć `@nestjs/throttler`
- [ ] **Request/response logging middleware** — brak logowania HTTP requestów
- [ ] **Rozmiar requestów** — brak limitu `body-parser` (ryzyko DoS)
- [ ] **GraphQL schema validation** — brak walidacji SDL
- [ ] **Dokumentacja proto** — kontrakty gRPC bez komentarzy
- [ ] **Circuit breaker** — brak obsługi awarii gRPC między serwisami
  - Rozważyć `opossum` lub własny mechanizm retry z backoffem
- [ ] **ADR (Architecture Decision Records)** — brak dokumentacji decyzji architektonicznych

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
