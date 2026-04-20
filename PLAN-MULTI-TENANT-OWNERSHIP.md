# Plan: multi-tenant ownership + subskrypcje + flow rejestracji

Cel: user-owner może mieć wiele tenantów. Pełny flow: rejestracja bez slug → email z potwierdzeniem → logowanie → wybór planu subskrypcji → tworzenie tenantów z konfiguracją platform/komend/customization → zarządzanie listą tenantów.

---

## Stan obecny (ustalony z kodu)

- [User.entity.ts](src/libs/entities/src/user/user.entity.ts) ma pojedyncze pole `tenantId: string | null` — twarde 1:1.
- [RegisterHandler](src/bff-service/user/commands/handlers/register.handler.ts) tworzy tenant od razu przy rejestracji (wymaga `tenantSlug` w inpucie) i przypisuje usera jako `UserType.OWNER` z tym `tenantId`.
- [AddUserHandler](src/db-service/user/commands/handlers/add-user.handler.ts) wpisuje pojedynczy `tenantId` do usera.
- [TenantInterceptor](src/libs/tenant/src/interceptors/tenant.interceptor.ts) zwraca jeden `TenantContext`; session przechowuje `session.tenant_id` (pojedynczy).
- [TenantResolver.tenants()](src/bff-service/tenant/tenant.resolver.ts) istnieje pod `OwnerGuard`, ale zwraca **wszystkie** tenanty w systemie, nie tenanty właściciela.
- Token rejestracyjny działa (cache + link `/confirm-registration?token=...`), ale email używa szablonu „Reset your password" — [mail-token.platform.ts](src/notify-service/outgoing/platforms/smtp/mail-token.platform.ts) (jest TODO w kodzie).
- Brak encji Subscription/Plan/Billing/Quota w całym repo.
- `maxUsersPerTenant` istnieje w [customization.types.ts](src/libs/customization/src/customization.types.ts) jako feature — zły „home" dla limitów planu.
- Commands: [command.entity.ts](src/libs/entities/src/command/command.entity.ts) globalne + [tenant-command-config.entity.ts](src/libs/entities/src/tenant/tenant-command-config.entity.ts) per-tenant override. **Brak flagi system/custom**. Brak seedu.
- Platformy: [platform-credentials.entity.ts](src/libs/entities/src/tenant/platform-credentials.entity.ts), 5 platform (Signal, WhatsApp, Messenger, SMS, Email), fallback przez sentinel UUID.
- Brak UI tenant switchera ani listy tenantów właściciela.

---

## Decyzje modelowe (do potwierdzenia)

1. **Ownership**: `Tenant.ownerUserId` FK (1:N User→Tenant) zamiast tabeli M:N. Prostsze, pokrywa przypadek „owner ma wiele tenantów".
2. **`User.tenantId`**: usunąć całkowicie. „Aktywny tenant" żyje tylko w `session.tenant_id` + cache `user-state`.
3. **Rejestracja**: user rejestruje się bez tenanta. Tenant tworzy się osobnym flow po zalogowaniu.
4. **Subskrypcja per user-owner** (nie per tenant) — limity liczone globalnie dla ownera. Do potwierdzenia.

---

## Faza 1 — Rejestracja bez tenanta

### Backend
- `RegisterInput`: usunąć `tenantSlug`. [register.handler.ts](src/bff-service/user/commands/handlers/register.handler.ts) tworzy **tylko** usera (`UserType.OWNER`, status `Pending`, bez `tenantId`).
- `AddUserCommand` — już pozwala na `tenantId: null` (kolumna nullable).
- Event `SendRegistrationTokenEvent` bez zmian, ale:
  - Nowy template email „Confirm your registration" → rozbić [mail-token.platform.ts](src/notify-service/outgoing/platforms/smtp/mail-token.platform.ts) na warianty (`reset-password`, `confirm-registration`) albo dodać `sendRegistrationConfirmation()`.
- `ConfirmRegistrationHandler` — tylko status → Active, bez tenanta.

### Frontend
- Registration form — wywalić pole slug.
- Strona `/confirm-registration?token=...` — zostaje.
- Po confirm → redirect do logowania (nie auto-login).

---

## Faza 2 — Subskrypcje i plany

### Nowe encje (`shared_config` schema)

**`SubscriptionPlan`** (katalog planów, seedowany, read-only dla userów):

```
id, code ('minimal'|'standard'|'pro'|'full'), name,
maxTenants, maxPlatformsPerTenant, maxUsersPerTenant,
maxCustomCommandsPerTenant, priceCents, currency, isActive
```

**`UserSubscription`** (wybór usera):

```
id, userId (FK users, unique), planId (FK subscription_plans),
status (active|canceled|expired), startedAt, expiresAt, createdAt, updatedAt
```

### Migracje
- `CREATE TABLE shared_config.subscription_plans` + seed 4 planów.
- `CREATE TABLE shared_config.user_subscriptions`.

### API (bff)
- Query `subscriptionPlans: [SubscriptionPlan]` — publiczne (widok po zalogowaniu na home).
- Query `mySubscription: UserSubscription` — dla zalogowanego.
- Mutation `selectSubscription(planId)` — tworzy/aktualizuje `UserSubscription`.
- Na razie bez płatności — placeholder; tylko zapis wyboru.

### Enforcement limitów
Guard/checker wywoływany przy:
- tworzeniu tenanta → `countTenants(userId) < plan.maxTenants`;
- [UpsertPlatformCredentials](src/db-service/tenant/platform-credentials.service.ts) → `countPlatformsForTenant(tenantId) < plan.maxPlatformsPerTenant`;
- dodawaniu usera do tenanta → `maxUsersPerTenant`;
- tworzeniu custom command / `UpsertTenantCommandConfig` dla nie-systemowej → `maxCustomCommandsPerTenant`.

Usunąć `maxUsersPerTenant` z [customization features](src/libs/customization/src/customization.types.ts) — to limit planu, nie customizacja.

---

## Faza 3 — System commands vs custom

### Zmiana w modelu
[Command.entity.ts](src/libs/entities/src/command/command.entity.ts):
- Dodać `isSystem: boolean` (default false).
- Dodać `tenantId: uuid | null`. System: `isSystem=true, tenantId=null`. Custom: `isSystem=false, tenantId=<tenant>`.

### Seed standardowych komend
Nowa migracja `seed-system-commands.ts` — wstawia zestaw standardowych komend z `isSystem=true`. Lista do ustalenia.

### Guardy edycji
- [TenantResolver.upsertTenantCommandConfig](src/bff-service/tenant/tenant.resolver.ts): dla `isSystem=true` — dozwolone tylko toggling `active` (i ew. `parametersOverride` jeśli plan na to pozwala). `actions`, `descriptionI18n` zablokowane — do decyzji.
- Usunięcie / zmiana definicji system command — zabronione dla ownera.

---

## Faza 4 — Ownership tenantów

### Model
- Dodać `Tenant.ownerUserId uuid not null` + FK → `users.id`, indeks.
- **Usunąć** `User.tenantId` z [user.entity.ts](src/libs/entities/src/user/user.entity.ts).
- „Aktywny tenant" → wyłącznie `session.tenant_id` + cache `user-state` (jak już jest w [tenant.interceptor.ts](src/libs/tenant/src/interceptors/tenant.interceptor.ts)).
- Members tenanta (nie-ownerzy dodani do tenanta): potrzebny osobny model `TenantMember (tenantId, userId, role)` — bo `User.tenantId` znika, a user-owner jednego tenanta może być dodany jako member do innego.

### Migracje
- Backfill: dla każdego istniejącego tenanta → `ownerUserId` = user z rolą OWNER i `tenant_id = tenant.id`.
- Po backfillu: drop kolumny `users.tenant_id`.

### API
- `myTenants: [Tenant]` — lista tenantów gdzie `ownerUserId = currentUser.id`.
- `createTenant(input)` — ustawia `ownerUserId = currentUser.id`, waliduje `plan.maxTenants`, nie wymaga aktywnego tenant context.
- `updateTenant(id, input)` — edycja slug/isActive/customization; guard sprawdza ownership.
- `deleteTenant(id)` / `deactivateTenant(id)` — opcjonalnie.
- `switchTenant(tenantId)` — waliduje ownership, ustawia `session.tenant_id`, odświeża `user-state` cache.
- Nowy `TenantOwnershipGuard` — weryfikuje że dany `tenantId` należy do zalogowanego usera.

### Interceptor
- Operacje zarządzania tenantami (create/list/update/switch) muszą działać **poza** kontekstem konkretnego tenanta — nie mogą wymagać `TenantContext`. Wprowadzić `@SkipTenantContext` albo jawnie przyjmować `targetTenantId` w inpucie.

---

## Faza 5 — Wizard tworzenia tenanta

### UI (frontend)
Po wybraniu subskrypcji, owner klika „Create tenant":
1. **Krok 1 — Slug + nazwa**: walidacja unikalności (`tenantSlugAvailable(slug)` query).
2. **Krok 2 — Platformy**: lista 5 platform, konfiguracja w limicie planu. Skip → defaults.
3. **Krok 3 — Komendy**: lista systemowych (pre-checked, nie-usuwalnych), możliwość dodania własnych do limitu planu. Skip → tylko systemowe.
4. **Krok 4 — Customization**: branding, features → edycja lub „use defaults".
5. **Finish** → tenant aktywny, redirect do listy tenantów lub dashboardu tenanta.

### API (bff)
- `createTenant` — już jest w [tenant.resolver.ts](src/bff-service/tenant/tenant.resolver.ts); rozszerzyć o `ownerUserId` z kontekstu, walidować `plan.maxTenants`.
- `upsertPlatformCredentials`, `updateTenantCustomization`, `upsertTenantCommandConfig` — już są, dołożyć enforcement limitów i ownership guard (akcja wymaga `targetTenantId` + weryfikacji ownership, niezależnie od subdomain).

---

## Faza 6 — Strona główna po zalogowaniu

- Dashboard: `mySubscription` + `myTenants`.
- Brak subskrypcji → ekran wyboru planu (Faza 2).
- Subskrypcja + brak tenantów → CTA „Utwórz pierwszy tenant" (Faza 5).
- ≥1 tenant → lista z akcjami (open, edit, delete?, create new jeśli `count < maxTenants`).
- Tenant switcher w headerze → `switchTenant(tenantId)`.
- Dotychczasowe [use-tenant.ts](src/front-service/src/hooks/use-tenant.ts) bez zmian — nadal czyta aktywny tenant.

---

## Podsumowanie faz

| Faza | Zawartość | Blokuje |
|---|---|---|
| 1 | Rejestracja bez slug + dedykowany email | — |
| 2 | Plany + subskrypcje + limity | Faza 5 enforcement |
| 3 | System vs custom commands + seed | Faza 5 krok 3 |
| 4 | `Tenant.ownerUserId`, drop `User.tenantId`, members, switch API | Faza 5 |
| 5 | Wizard tworzenia tenanta | Faza 6 |
| 6 | UI: home, plany, lista tenantów, switcher | — |

---

## Otwarte pytania

1. **Subskrypcja per user-owner czy per tenant?** (zmienia model limitów).
2. **Members tenanta**: osobna tabela `TenantMember` czy inna forma?
3. **System commands**: co owner może modyfikować? (tylko on/off vs parametry vs prompt).
4. **Płatności** w tym kroku, czy tylko placeholder (free-select)?
5. **Konkretna lista standardowych komend** do seedowania.
6. **Downgrade planu**: co gdy user ma więcej zasobów niż nowy plan pozwala? (block / soft-limit / grace period).
