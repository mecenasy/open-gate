# Plan: multi-tenant ownership + subskrypcje + flow rejestracji

Cel: user-owner może mieć wiele tenantów. Pełny flow: rejestracja bez slug → email z potwierdzeniem → logowanie → wybór planu subskrypcji → tworzenie tenantów z konfiguracją platform/komend/customization → zarządzanie listą tenantów. Oddzielna populacja „contacts" — odbiorcy komunikacji, nie logują się.

---

## Model ról i populacji (zatwierdzony)

Dwie rozłączne populacje ludzi w systemie:

### 1. `users` — ci co się logują (mała tabela)

- Zawiera: platform admini + tenant staff (owner/admin/support).
- Pełny auth: hasło, passkey, MFA, historia logowań, settings.
- `User.type` (globalny):
  - `PLATFORM_ADMIN` — operator platformy. Seeduje system commands, zarządza planami, może wchodzić w każdy tenant. Seed w migracji; rejestracja zarezerwowana (invite-only).
  - `TENANT_STAFF` — zwykły self-service user; rejestruje się, może zakładać tenanty.
- Stary `UserType.OWNER` znika z globalnego enumu — „owner" to teraz rola per-tenant.

### 2. `contacts` — odbiorcy komunikacji (duża tabela)

- Nie logują się. Brak hasła, brak MFA.
- Pola: `id`, `email`, `phone`, `name`, `surname`, `accessLevel`.
- `accessLevel`: `PRIMARY` (dostaje dokumenty + powiadomienia) | `SECONDARY` (tylko powiadomienia masowe).
- Relacja z tenantami: M:N przez `contact_memberships` (contact może być w wielu tenantach — „ktoś ma dwa mieszkania w dwóch wspólnotach").
- `ContactGroup` (rodzina/mieszkanie) — **odłożone na później**, MVP używa flagi `accessLevel` na samym contactcie.

### 3. `tenant_staff` — kto zarządza którymi tenantami (M:N users↔tenants)

- `(tenantId, userId, role)` gdzie `role`:
  - `OWNER` — współwłaściciel tenanta, dodaje innych OWNERów, pełne prawa.
  - `ADMIN` — zarządza operacyjnie (platformy, customization, komendy custom, contacts), nie dodaje ownerów, nie tyka billingu.
  - `SUPPORT` — obsługa codzienna (komunikacja, edycja contacts), nie konfiguruje tenanta.
- Obecny `User.tenantId` → **drop**. Staff ma relację przez `tenant_staff`.

### 4. Billing

- `Tenant.billingUserId` (FK → users) — user, którego subskrypcja pokrywa ten tenant. Liczy się do `plan.maxTenants` dla tego usera.
- Osobno od OWNER, bo można być współwłaścicielem bez odpowiedzialności finansowej.
- Twórca tenanta jest domyślnie `billingUserId` + `OWNER` w `tenant_staff`.
- Dodanie kolejnego OWNERa = wpis w `tenant_staff`, **nie** zmienia `billingUserId`.

---

## Stan obecny (ustalony z kodu)

- [User.entity.ts](src/libs/entities/src/user/user.entity.ts) ma pojedyncze pole `tenantId: string | null` — twarde 1:1.
- [RegisterHandler](src/bff-service/user/commands/handlers/register.handler.ts) tworzy tenant od razu przy rejestracji (wymaga `tenantSlug` w inpucie) i przypisuje usera jako `UserType.OWNER` z tym `tenantId`.
- [AddUserHandler](src/db-service/user/commands/handlers/add-user.handler.ts) wpisuje pojedynczy `tenantId` do usera.
- [TenantInterceptor](src/libs/tenant/src/interceptors/tenant.interceptor.ts) zwraca jeden `TenantContext`; session przechowuje `session.tenant_id` (pojedynczy).
- [TenantResolver.tenants()](src/bff-service/tenant/tenant.resolver.ts) istnieje pod `OwnerGuard`, ale zwraca **wszystkie** tenanty w systemie.
- Token rejestracyjny działa (cache + link `/confirm-registration?token=...`), ale email używa szablonu „Reset your password" — [mail-token.platform.ts](src/notify-service/outgoing/platforms/smtp/mail-token.platform.ts) (jest TODO w kodzie).
- Brak encji Subscription/Plan/Billing/Quota.
- `maxUsersPerTenant` istnieje w [customization.types.ts](src/libs/customization/src/customization.types.ts) jako feature — zły „home" dla limitów planu.
- Commands: [command.entity.ts](src/libs/entities/src/command/command.entity.ts) globalne + [tenant-command-config.entity.ts](src/libs/entities/src/tenant/tenant-command-config.entity.ts) per-tenant override. Brak flagi system/custom, brak seedu.
- Brak UI tenant switchera ani listy tenantów właściciela.
- Brak encji `Contact`.

---

## Faza 1 — Rejestracja bez tenanta

### Backend
- `RegisterInput`: usunąć `tenantSlug`. [register.handler.ts](src/bff-service/user/commands/handlers/register.handler.ts) tworzy **tylko** usera (status `Pending`, bez `tenantId`, `type: TENANT_STAFF`).
- `AddUserCommand` — już pozwala na `tenantId: null` (kolumna nullable).
- Event `SendRegistrationTokenEvent` bez zmian, ale nowy template email „Confirm your registration" → rozbić [mail-token.platform.ts](src/notify-service/outgoing/platforms/smtp/mail-token.platform.ts) na warianty (`reset-password`, `confirm-registration`).
- `ConfirmRegistrationHandler` — tylko status → Active, bez tenanta.

### Frontend
- Registration form — usunąć pole slug.
- Strona `/confirm-registration?token=...` — zostaje.
- Po confirm → redirect do logowania (nie auto-login).

---

## Faza 2 — Subskrypcje i plany

### Nowe encje (`shared_config` schema)

**`SubscriptionPlan`** (katalog, seedowany, read-only dla userów):
```
id, code ('minimal'|'standard'|'pro'|'full'), name,
maxTenants, maxPlatformsPerTenant, maxContactsPerTenant,
maxStaffPerTenant, maxCustomCommandsPerTenant,
priceCents, currency, isActive
```

**`UserSubscription`** (wybór usera, per user-owner):
```
id, userId (FK users, unique), planId (FK subscription_plans),
status (active|canceled|expired), startedAt, expiresAt, createdAt, updatedAt
```

### Migracje
- `CREATE TABLE shared_config.subscription_plans` + seed 4 planów.
- `CREATE TABLE shared_config.user_subscriptions`.

### API (bff)
- Query `subscriptionPlans: [SubscriptionPlan]` — po zalogowaniu.
- Query `mySubscription: UserSubscription` — dla zalogowanego.
- Mutation `selectSubscription(planId)` — tworzy/aktualizuje `UserSubscription`.
- Płatności — placeholder; tylko zapis wyboru.

### Enforcement limitów
- Tworzenie tenanta → `countTenants(billingUserId) < plan.maxTenants`.
- [UpsertPlatformCredentials](src/db-service/tenant/platform-credentials.service.ts) → `countPlatformsForTenant(tenantId) < plan.maxPlatformsPerTenant`.
- Dodawanie kontaktu → `maxContactsPerTenant`.
- Dodawanie tenant staff → `maxStaffPerTenant`.
- Custom command / `UpsertTenantCommandConfig` dla nie-systemowej → `maxCustomCommandsPerTenant`.

Usunąć `maxUsersPerTenant` z [customization features](src/libs/customization/src/customization.types.ts) — to limit planu.

---

## Faza 3 — System commands vs custom

### Zmiana w modelu
[Command.entity.ts](src/libs/entities/src/command/command.entity.ts):
- `isSystem: boolean` (default false).
- `tenantId: uuid | null`. System: `isSystem=true, tenantId=null`. Custom: `isSystem=false, tenantId=<tenant>`.

### Seed standardowych komend
Nowa migracja `seed-system-commands.ts` — wstawia zestaw standardowych komend z `isSystem=true`. Listę ustala PLATFORM_ADMIN (do dopisania).

### Guardy edycji
- System command: tylko `PLATFORM_ADMIN` modyfikuje definicję (prompt, akcje, parametry).
- Tenant staff (OWNER/ADMIN): może tylko toggle `active` i ustawiać `parametersOverride` w `TenantCommandConfig`.
- Custom command: OWNER/ADMIN tenanta edytuje, SUPPORT nie.

---

## Faza 4 — Ownership + contacts

### Model: tenant staff

- Nowa tabela `tenant_staff (tenant_id, user_id, role, created_at, updated_at)`, PK composite `(tenant_id, user_id)`, role enum `OWNER|ADMIN|SUPPORT`.
- `Tenant.billingUserId uuid not null` + FK → `users.id`, indeks.
- **Usunąć** `User.tenantId` z [user.entity.ts](src/libs/entities/src/user/user.entity.ts).
- `User.type` enum: `PLATFORM_ADMIN | TENANT_STAFF` (usunąć `UserType.OWNER`).
- „Aktywny tenant" → wyłącznie `session.tenant_id` + cache `user-state`.

### Model: contacts

- Nowa tabela `contacts (id, email, phone, name, surname, created_at, updated_at)` — globalna, deduplikowana po email/phone (do decyzji: unique key).
- Nowa tabela `contact_memberships (contact_id, tenant_id, access_level, created_at)`, PK composite, `access_level`: `PRIMARY|SECONDARY`.

### Migracje
- `CREATE TABLE tenant_staff` + backfill: dla każdego istniejącego tenanta → `OWNER` = user z `tenant_id = tenant.id` i starym `UserType.OWNER`.
- `ALTER TABLE tenants ADD COLUMN billing_user_id` + backfill z tego samego źródła.
- `CREATE TABLE contacts`, `CREATE TABLE contact_memberships` (na razie puste — nie ma starych „members" do zmigrowania).
- Drop `users.tenant_id`.
- Migracja `users.type`: `OWNER → TENANT_STAFF`.

### API
- `myTenants: [Tenant]` — `billingUserId = currentUser.id`.
- `tenantsIStaffAt: [TenantStaff]` — wszystkie gdzie mam wpis w `tenant_staff`.
- `createTenant(input)` — ustawia `billingUserId = currentUser.id`, tworzy wpis w `tenant_staff` z `OWNER`, waliduje `plan.maxTenants`.
- `updateTenant(id, input)` / `deleteTenant(id)` — guard OWNER w `tenant_staff`.
- `switchTenant(tenantId)` — waliduje członkostwo w `tenant_staff`, ustawia `session.tenant_id`.
- `addTenantStaff(tenantId, userEmail, role)` — OWNER required do dodania innego OWNERa; ADMIN może dodawać SUPPORT.
- `removeTenantStaff(tenantId, userId)`, `changeTenantStaffRole(tenantId, userId, role)`.
- `tenantContacts(tenantId)`, `addContact(tenantId, input)`, `updateContact(contactId, input)`, `removeContactFromTenant(tenantId, contactId)`.
- Nowe guardy: `TenantStaffGuard(minRole)`, `PlatformAdminGuard`.

### Interceptor
- Operacje zarządzania tenantami (list/create/switch) muszą działać **poza** kontekstem konkretnego tenanta. Wprowadzić `@SkipTenantContext` albo jawnie przyjmować `targetTenantId` w inpucie.

---

## Faza 5 — Wizard tworzenia tenanta

Po wybraniu subskrypcji owner klika „Create tenant":
1. **Krok 1** — slug + nazwa; walidacja unikalności (`tenantSlugAvailable(slug)`).
2. **Krok 2** — platformy; konfiguracja w limicie planu. Skip → defaults.
3. **Krok 3** — komendy; lista systemowych (pre-checked, nie-usuwalnych), możliwość dodania własnych do limitu planu. Skip → tylko systemowe.
4. **Krok 4** — customization; branding, features → edycja lub „use defaults".
5. **Krok 5 (opcjonalny)** — contacts; import CSV lub „dodam później".
6. **Finish** → tenant aktywny.

API: `createTenant`, `upsertPlatformCredentials`, `updateTenantCustomization`, `upsertTenantCommandConfig`, `addContact` — dołożyć enforcement limitów i ownership guard.

---

## Faza 6 — Strona główna po zalogowaniu

- Dashboard: `mySubscription` + sekcje tenantów:
  - „Moje tenanty" (billingUserId = ja).
  - „Współzarządzane" (jestem w tenant_staff u kogoś, rola OWNER/ADMIN/SUPPORT).
- Brak subskrypcji → ekran wyboru planu (Faza 2).
- Subskrypcja + brak tenantów → CTA „Utwórz pierwszy tenant" (Faza 5).
- ≥1 tenant → lista z akcjami (open, edit, delete?, create new jeśli `count < maxTenants`).
- Tenant switcher w headerze → `switchTenant(tenantId)`.
- Osobne widoki: książka adresowa contacts, zarządzanie staffem.

---

## Podsumowanie faz

| Faza | Zawartość | Commit | Blokuje |
|---|---|---|---|
| 1 | Rejestracja bez slug + dedykowany email | 1 commit | — |
| 2 | Plany + subskrypcje + limity | 1 commit | Faza 5 enforcement |
| 3 | System vs custom commands + seed | 1 commit | Faza 5 krok 3 |
| 4 | `tenant_staff`, `contacts`, drop `User.tenantId`, switch API | 1 commit | Faza 5 |
| 5 | Wizard tworzenia tenanta | 1 commit | Faza 6 |
| 6 | UI: home, plany, lista tenantów, switcher, contacts | 1 commit | — |

---

## Odłożone na później

- `ContactGroup` (rodzina/mieszkanie) z `primaryContactId` — zaczynamy od flagi `accessLevel` na contact.
- Globalny `PLATFORM_SUPPORT` (pracownicy platformy z read-only access do każdego tenanta).
- Per-tenant `GUEST` (read-only) i `BILLING` (tylko faktury).
- Płatności realne (Stripe/PayU). Na razie placeholder.
- Polityka downgrade'u planu (block / soft-limit / grace period) — do decyzji gdy będzie real billing.
- Deduplikacja contact po email globalnie vs. per tenant — do decyzji przy implementacji Fazy 4.
