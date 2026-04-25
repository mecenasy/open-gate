# Plan: pełna konfiguracja tenanta + self-service zmiana planu

Uzupełnia [PLAN-MULTI-TENANT-OWNERSHIP.md](PLAN-MULTI-TENANT-OWNERSHIP.md) o dwie rzeczy, które zostały „odłożone" albo nie zostały dostarczone:

1. **Egzekwowanie limitów planu** (Faza 2 starego planu nie weszła do kodu).
2. **Zmiana/anulowanie subskrypcji + edycja ustawień istniejącego tenanta** (brak UI i brak bezpiecznej ścieżki downgrade).

---

## Stan obecny (ustalony z kodu)

- [SubscriptionService.selectPlan](src/db-service/subscription/subscription.service.ts) ślepo zamienia plan — brak walidacji zużycia.
- [TenantAdminService.createTenant](src/bff-service/tenant/tenant-admin.service.ts) i [TenantController.createTenant](src/db-service/tenant/tenant.controller.ts) nie sprawdzają `plan.maxTenants`.
- `upsertPlatformCredentials`, `addTenantStaff`, `addContact`, `upsertTenantCommandConfig` — bez limit-checków.
- [PlanPicker](src/front-service/src/app/[locale]/home/components/PlanPicker.tsx) renderowany tylko w gałęzi `!subscription` w [HomeView](src/front-service/src/app/[locale]/home/HomeView.tsx) — po wybraniu planu user nie ma już żadnego wejścia do zmiany.
- Brak widoku edycji istniejącego tenanta — jest tylko kreator `/tenants/new`.
- [TenantStaffGuard](src/bff-service/tenant/tenant.resolver.ts) istnieje i działa — do reużycia w edycji settings.
- [AuditService] nie istnieje — TODO.md #Security hardening wymaga „audit logging for sensitive operations".
- [admin.guard.ts](src/bff-service/common/guards/admin.guard.ts) ma placeholder (TODO.md: „admin.guard.ts:10 — zaimplementować właściwą logikę") — potrzebny poprawny `PlatformAdminGuard` dla override limitów.

---

## Co z .md włączone do planu

- **TODO.md #Security hardening → audit logging** → Commit 7.
- **TODO.md #Future Enhancements → caching strategy** → invalidation po mutacjach w commicie 2, 4.
- **TODO.md #TODO w kodzie → admin.guard.ts:10** → doprecyzowany w commicie 1 jako `PlatformAdminGuard`.
- **PLAN-MULTI-TENANT-OWNERSHIP.md → Faza 2 enforcement** → Commit 1 (brakująca implementacja).
- **PLAN-MULTI-TENANT-OWNERSHIP.md → Faza 5 (wizard)** → domknięcie w commicie 6.
- **PLAN-MULTI-TENANT-OWNERSHIP.md → Odłożone → downgrade policy** → rozstrzygnięte (hard-block z listą naruszeń) w commicie 2.
- **PLAN-MULTI-TENANT-OWNERSHIP.md → Odłożone → Stripe** → abstrakcja `BillingProvider` + `NoopBillingProvider` w commicie 8, real Stripe poza tym planem.
- **[TENANT_CONTEXT.md](src/bff-service/tenant/TENANT_CONTEXT.md) → „tenantId nigdy z frontendu"** → świadomy wyjątek dla edycji settings (user z N tenantami wybiera który edytuje); `TenantStaffGuard` waliduje członkostwo dla każdego argumentu `tenantId`.

Wykluczone jako niezwiązane: `command.service.ts:89 actionFilter`, `gate.service.ts` TODO, `groq` alarm, Elasticsearch, IaC.

---

## Fazy (= commity)

### Commit 1 — backend: enforcement limitów planu  ✅ ZREALIZOWANE

**Fundament. Bez tego nie da się zrobić uczciwego downgrade'u ani `ChangePlanModal`.**

1. Nowa biblioteka `src/libs/quotas/`:
   - `QuotaService.getUsage(billingUserId)` → `{ tenants, perTenant: { [tenantId]: { staff, platforms, contacts, customCommands } } }`.
   - `assertCanCreateTenant(billingUserId)` — `count(tenants where billing_user_id = ?)` vs `plan.maxTenants`.
   - `assertCanAddStaff(tenantId)` — `count(tenant_staff)` vs `maxStaffPerTenant`.
   - `assertCanAddPlatform(tenantId)` — `count(platform_credentials)` vs `maxPlatformsPerTenant`.
   - `assertCanAddContact(tenantId)` — `count(contact_memberships)` vs `maxContactsPerTenant`.
   - `assertCanAddCustomCommand(tenantId)` — `count(commands where isSystem=false AND tenantId=?)` vs `maxCustomCommandsPerTenant`.
   - Plan brany z `billingUserId` tenanta (nie bieżącego usera) — kluczowe gdy ADMIN działa w cudzym tenancie.
2. `PlanLimitExceededException extends BadRequestException` z polami `{ kind, current, max, planCode, tenantId? }`.
3. [global-exception.filter.ts](src/libs/logger/global-exception.filter.ts) mapuje na `extensions.code = PLAN_LIMIT_EXCEEDED` + payload.
4. Podłączenie w db-service: `TenantController.createTenant`, `TenantStaffService.add`, `PlatformCredentialsService.upsert`, `ContactService.addMembership`, `TenantCommandConfigService.upsert` (tylko gdy command.isSystem=false).
5. Usunąć `maxUsersPerTenant` z [customization.types.ts](src/libs/customization/src/customization.types.ts) (zgodnie z PLAN-MT-OWNERSHIP § Faza 2).
6. Fix [admin.guard.ts](src/bff-service/common/guards/admin.guard.ts) → `PlatformAdminGuard` sprawdza `user.type === PLATFORM_ADMIN` (reużywa decorator `@CurrentUser`).
7. Testy integracyjne per asercja (limit=N-1, N, N+1).

**Commit:** `feat(quotas): enforce plan limits at mutation boundaries`

---

### Commit 2 — backend: preview + zmiana + anulowanie planu

1. Migracja `shared_config.subscription_changes` (`id, userId, oldPlanId, newPlanId, kind ENUM('upgrade'|'downgrade'|'cancel'|'initial'), violations_json jsonb, initiated_at, correlation_id`).
2. Nowa query GraphQL `previewPlanChange(newPlanId)`:
   ```
   type PlanChangePreview {
     newPlan: SubscriptionPlan!
     kind: PlanChangeKind!              # upgrade | downgrade | same
     violations: [QuotaViolation!]!      # puste = można
     deltaPriceCents: Int!
   }
   type QuotaViolation {
     kind: String!                        # tenants | staff | platforms | contacts | customCommands
     tenantId: String
     current: Int!
     newMax: Int!
   }
   ```
3. `selectSubscription(planId)`:
   - jeśli `kind=downgrade` i `violations.length > 0` → `BadRequestException` z listą,
   - zapis do `subscription_changes`,
   - invalidate cache: `user-state:<userId>`, `tenant-plan:<tenantId>` dla każdego tenanta billing-usera.
4. `cancelSubscription()` → `status = Canceled`; od tej chwili `assertCanCreateTenant` rzuca; istniejące tenanty niezmienione.
5. `SubscriptionResolver` woła `BillingProvider` (abstrakcja → commit 8), na razie zaślepka zwracająca success.

**Commit:** `feat(subscription): plan change preview, downgrade guard, audit trail`

---

### Commit 3 — frontend: UI zmiany planu + usage

1. Dodać button "Zmień plan" do [SubscriptionBanner](src/front-service/src/app/[locale]/home/components/SubscriptionBanner.tsx) → link do `/settings/billing`.
2. Nowa feature `src/front-service/src/app/[locale]/settings/tabs/billing/`:
   ```
   tabs/billing/
     BillingTab.tsx
     components/
       CurrentPlanCard.tsx           # plan + cena + "Zmień" | "Anuluj"
       UsageMeters.tsx               # progress per limit (z getUsage)
       ChangePlanModal.tsx           # PlanPicker + preview + violations list
       CancelSubscriptionModal.tsx   # type-to-confirm
       SubscriptionHistoryTable.tsx  # z subscription_changes
     hooks/
       queries.ts                    # GET_BILLING_DATA (mySubscription + plans + usage + history)
       use-preview-plan-change.ts
       use-change-plan.ts
       use-cancel-subscription.ts
   ```
3. `ChangePlanModal` flow: wybierz plan → `previewPlanChange` → jeśli violations: czerwona lista „aby zmienić plan, usuń: 2 tenantów, 15 contactów w `tenant-x`"; jeśli ok: diff limitów + cena + confirm.
4. Reużyć istniejący [PlanPicker](src/front-service/src/app/[locale]/home/components/PlanPicker.tsx) w modalu (DRY).
5. i18n namespace `billing.*`.

**Commit:** `feat(billing): self-service plan change with usage and history`

---

### Commit 4 — backend: mutacje konfiguracji tenanta (per sekcja)

**Dziś jest tylko `updateCustomization(tenantId, customizationJson)` (cały JSON) i `updateFeatures`. Dokładam per-sekcję z optimistic lock.**

1. Nowy `TenantSettingsResolver` (BFF):
   - `updateTenantBranding(tenantId, BrandingInput, ifUnmodifiedSince)` — `TenantStaffGuard(Admin)`.
   - `updateTenantMessaging(tenantId, MessagingInput, ...)` — `Admin`; serwer woła `validateMessagingChannels`.
   - `updateTenantCommands(tenantId, CommandsInput, ...)` — `Admin`.
   - `updateTenantCompliance(tenantId, ComplianceInput, ...)` — `Owner` (sensitive).
   - `updateTenantFeatures` — istnieje; podmień guard na `Admin`.
2. Lifecycle:
   - `transferTenantBilling(tenantId, newBillingUserId)` — `Owner`; waliduje `plan.maxTenants` nowego billing-usera; audit.
   - `setTenantActive(tenantId, active)` — `Owner`; soft deactivate (`is_active=false`).
   - `deleteTenant(tenantId, slugConfirmation)` — `Owner`; wymaga podania sluga; transakcja: drop `tenant_staff`, `contact_memberships`, `customization_config`, `platform_credentials`, `tenant_command_config`, `tenant_prompt_overrides`, `tenants`; `DROP SCHEMA "tenant_<slug>" CASCADE`; audit.
3. Każda update-mutacja:
   - read `CustomizationConfig`,
   - optimistic lock po `updated_at` (input `ifUnmodifiedSince`) — 409 gdy konflikt,
   - walidacja domenowa (`validateMessagingChannels`, hex colors, URL webhook),
   - write + invalidate `tenant-customization:<tenantId>`,
   - audit log dla compliance/transfer/delete.

**Commit:** `feat(tenant-settings): per-section mutations + lifecycle + audit`

---

### Commit 5 — frontend: `/tenants/[slug]/settings/` feature

Zgodne z [src/front-service/CLAUDE.md](src/front-service/CLAUDE.md) (feature-local, RHF + zod, jeden FormModal per feature, i18n).

```
app/[locale]/tenants/[slug]/settings/
  page.tsx                     # RSC: fetch tenant + customization + staff
  SettingsView.tsx             # client: Tabs
  tabs/
    general/                    # slug ro, isActive, transferBilling, deleteTenant (type-to-confirm)
    branding/                   # logoUrl, ColorPicker×2, fontSize select
    features/                   # edycja toggle-i (tego samego co wizard)
    messaging/                  # provider select, MultiSelect channels (≥1 z sms/email), rateLimitPerMinute
    commands/                   # timeout, maxRetries, processingDelay, customPromptLibraryEnabled
    compliance/                 # residency select (EU/US/APAC), encryption toggle, webhookUrl
    staff/                      # tabela + AddStaffModal (email lookup) + ChangeRole + Remove
    platforms/                  # reuse wizard credential components; CRUD
    custom-commands/            # komendy isSystem=false; upsert/delete z guardem maxCustomCommandsPerTenant
  interfaces.ts
  constants.ts                  # TABS, ROLE_LABEL_KEYS
```

Reguły:
- każda zakładka: jeden FormModal z `mode: 'add'|'edit'`, RHF + zod, bez `useState` per pole,
- `refetchQueries` po mutacji wskazuje document z `queries.ts`,
- i18n namespace `tenantSettings.<tab>`,
- jedna mutacja per sekcja (nie `updateCustomization` hurtem),
- błąd `PLAN_LIMIT_EXCEEDED` → toast z linkiem do `/settings/billing`,
- z [TenantCard](src/front-service/src/app/[locale]/home/components/TenantCard.tsx) dorzucić drugi button „Ustawienia" obok „Otwórz".

**Commit:** `feat(tenant-settings): /tenants/[slug]/settings UI with 9 tabs`

---

### Commit 6 — wizard: domknięcie (PLAN-MT-OWNERSHIP Faza 5)

1. Dodać kroki 4–5 do [TenantWizardView](src/front-service/src/app/[locale]/tenants/new/TenantWizardView.tsx):
   - **Platforms** — lista platform + pole JSON credentials; skip → defaults; walidacja `maxPlatformsPerTenant`.
   - **Custom commands** — lista systemowych (pre-checked, read-only) + „Dodaj custom" z walidacją `maxCustomCommandsPerTenant`.
2. Krok „Contacts" + import CSV (było odłożone, dokładam — nie jest sprzeczne z kierunkiem).
3. W każdym kroku pokazać pozostały budżet z `getUsage` („platformy: 2/5"); jeśli wyczerpany → CTA „Zmień plan" do `/settings/billing`.
4. `use-create-tenant-wizard` → po `createTenant` wywołuje sekwencyjnie: `upsertPlatformCredentials` × N, `upsertTenantCommandConfig` × N, `addContact` × N — partial success pokazuje listę błędów.

**Commit:** `feat(tenant-wizard): platforms + custom-commands + CSV import`

---

### Commit 7 — audit log (sensitive operations)

1. Migracja `shared_config.tenant_audit_log` (`id, tenantId nullable, userId, action text, payload_json jsonb, ip text, user_agent text, correlation_id, created_at`).
2. Nowa biblioteka `src/libs/audit/` → `AuditService` + dekorator `@Audit(action)` dla resolverów.
3. Podpiąć do:
   - `createTenant`, `deleteTenant`, `setTenantActive`, `transferTenantBilling`,
   - `addTenantStaff(role=Owner)`, `changeTenantStaffRole(→Owner)`,
   - `updateTenantCompliance`,
   - `selectSubscription`, `cancelSubscription`.
4. UI: zakładka `audit/AuditTab.tsx` w `/tenants/[slug]/settings/` — tabela read-only, widoczna tylko dla Owner.
5. Index na `(tenantId, created_at DESC)`; cleanup job poza zakresem.

**Commit:** `feat(audit): tenant_audit_log + hooks on sensitive actions`

---

### Commit 8 — BillingProvider abstraction (przygotowanie pod Stripe)

1. `src/libs/billing/` → `interface BillingProvider { previewChange, applyChange, cancel }` + `NoopBillingProvider` (zawsze success, 0€ prorated).
2. `SubscriptionService` używa providera przed zapisem.
3. Dodać do `UserSubscription`: `externalSubscriptionId?`, `cancelAtPeriodEnd: boolean`, `currentPeriodEnd?`.
4. `cancel()` → `status = ScheduledCancellation`, cron po `currentPeriodEnd` przerzuca na `Canceled`.
5. Placeholder `StripeBillingProvider` z sygnaturami (nie implementowany).

**Commit:** `refactor(subscription): BillingProvider abstraction (noop)`

---

## Kolejność i zależności

| # | Commit | Blokuje |
|---|--------|---------|
| 1 | quotas enforcement | 2, 4, 6 |
| 2 | plan change + preview + audit | 3 |
| 3 | billing UI | — |
| 4 | tenant settings mutations | 5 |
| 5 | tenant settings UI | — |
| 6 | wizard domknięcie | — (ale korzysta z quot z #1) |
| 7 | audit log cross-cutting | — |
| 8 | billing provider abstraction | (Stripe w przyszłości) |

Commit 1 jest niezbędny. Bez niego `previewPlanChange` nie ma czego walidować.

---

## Uwagi operacyjne

- **Cache invalidation** — po `selectSubscription`, `updateTenant*`, `transferTenantBilling`, `deleteTenant` wybijać `user-state:<userId>`, `tenant-plan:<tenantId>`, `tenant-customization:<tenantId>`; frontend — `refetchQueries` na odpowiednie documents.
- **Wyjątek od reguły „tenantId nigdy z frontendu"** — mutacje w `/tenants/[slug]/settings` biorą `tenantId` jako argument GraphQL (user z N tenantami wybiera który edytuje). `TenantStaffGuard(minRole)` waliduje członkostwo dla każdego argumentu — guard jest realnym zabezpieczeniem, nie source-of-truth.
- **Platform-admin override** — po fixie [admin.guard.ts](src/bff-service/common/guards/admin.guard.ts) `PLATFORM_ADMIN` może wejść w każdy tenant bez wpisu w `tenant_staff` i obejść limit, zawsze z audit logiem.
- **Delete tenant** — transakcja + rollback gdy `DROP SCHEMA` failuje; używa istniejącego `TenantSchemaManager`.

---

*Zaczynamy: Commit 1 — quotas enforcement.*
