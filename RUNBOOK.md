# Runbook — Open Gate Operations

**Data**: Kwiecień 2026  
**Dotyczy**: Multi-tenant deployment, tenant provisioning, rollback

---

## Spis Treści

1. [Dodanie nowego tenanta](#1-dodanie-nowego-tenanta)
2. [Aktualizacja customizacji tenanta](#2-aktualizacja-customizacji-tenanta)
3. [Dezaktywacja tenanta](#3-dezaktywacja-tenanta)
4. [Rollback migracji schematu](#4-rollback-migracji-schematu)
5. [Diagnostyka problemów](#5-diagnostyka-problemów)
6. [Bezpieczeństwo i izolacja danych](#6-bezpieczeństwo-i-izolacja-danych)
7. [Monitoring i alerty](#7-monitoring-i-alerty)

---

## 1. Dodanie nowego tenanta

### Wymagania wstępne
- Dostęp do PostgreSQL z uprawnieniami `CREATE SCHEMA`
- Uruchomiony db-service
- `psql` lub dostęp do bazy przez narzędzie administracyjne

### Kroki

#### 1.1 Utwórz rekord tenanta w `shared_config.tenants`

```sql
-- Krok 1: Wygeneruj UUID dla nowego tenanta
-- Można użyć: SELECT gen_random_uuid();

-- Krok 2: Wstaw rekord tenanta
INSERT INTO shared_config.tenants (id, slug, schema_name, is_active)
VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- wygenerowany UUID
  'nazwa-spoldzielni',                       -- URL-friendly, unikalne
  'tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', -- UUID bez myślników z prefiksem tenant_
  true
);
```

> **Konwencja nazwy schematu**: `tenant_` + UUID bez myślników  
> Przykład: UUID `a1b2c3d4-e5f6-7890-abcd-ef1234567890` → schema `tenant_a1b2c3d4e5f678 90abcdef1234567890`

#### 1.2 Utwórz schemat PostgreSQL

```sql
-- TenantSchemaManager.provisionSchema() robi to automatycznie, ale można ręcznie:
CREATE SCHEMA IF NOT EXISTS "tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
```

#### 1.3 Uruchom migracje TypeORM w nowym schemacie

```bash
# Ustaw search_path na schemat tenanta i uruchom migracje
DATABASE_SCHEMA=tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
  npm run migration:run --workspace=db-service
```

Lub przez db-service API (jeśli dostępne):
```bash
curl -X POST http://localhost:3002/admin/tenants/provision \
  -H 'Content-Type: application/json' \
  -d '{"tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}'
```

#### 1.4 Utwórz konfigurację customizacji

```sql
INSERT INTO shared_config.customization_config (id, tenant_id, config)
VALUES (
  gen_random_uuid(),
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  '{
    "branding": {
      "primaryColor": "#007bff"
    },
    "features": {
      "enableMFA": true,
      "enablePasskey": false,
      "enableSignal": true,
      "enableWhatsApp": false,
      "enableCommandScheduling": true,
      "enableAnalytics": false,
      "maxUsersPerTenant": 100
    },
    "messaging": {
      "defaultSmsProvider": "twilio",
      "priorityChannels": ["sms", "signal"],
      "rateLimitPerMinute": 30
    },
    "commands": {
      "timeout": 30000,
      "maxRetries": 3,
      "processingDelay": 0,
      "customPromptLibraryEnabled": false
    },
    "compliance": {
      "dataResidency": "EU",
      "encryptionEnabled": true
    },
    "custom": {}
  }'::jsonb
);

-- Zaktualizuj tenant z ID customizacji
UPDATE shared_config.tenants
SET customization_id = (
  SELECT id FROM shared_config.customization_config
  WHERE tenant_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
)
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

#### 1.5 Weryfikacja

```sql
-- Sprawdź czy schemat istnieje
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

-- Sprawdź tabele w schemacie
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

-- Sprawdź tenant record
SELECT t.id, t.slug, t.schema_name, t.is_active, c.config->'features' as features
FROM shared_config.tenants t
LEFT JOIN shared_config.customization_config c ON c.tenant_id = t.id
WHERE t.id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

---

## 2. Aktualizacja customizacji tenanta

### Zmiana provajdera SMS

```sql
UPDATE shared_config.customization_config
SET config = jsonb_set(
  config,
  '{messaging,defaultSmsProvider}',
  '"legacy"'::jsonb
),
updated_at = NOW()
WHERE tenant_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

### Włączenie/wyłączenie feature flag

```sql
-- Wyłączenie MFA dla tenanta
UPDATE shared_config.customization_config
SET config = jsonb_set(config, '{features,enableMFA}', 'false'::jsonb),
    updated_at = NOW()
WHERE tenant_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

> **Uwaga**: Po zmianie customizacji wymagane jest czyszczenie cache.  
> Cache in-memory w `TenantCustomizationService` odświeża się co 5 minut automatycznie.  
> Aby wymusić natychmiastowe odświeżenie: restartuj pod core-service lub bff-service.

---

## 3. Dezaktywacja tenanta

```sql
-- Soft-delete: wyłącz tenanta bez usuwania danych
UPDATE shared_config.tenants
SET is_active = false,
    updated_at = NOW()
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

> Schemat danych **nie jest usuwany**. Dane pozostają dostępne dla audytu.  
> Żądania z `x-tenant-id` nieaktywnego tenanta będą ignorowane przez `TenantGrpcInterceptor`.

### Pełne usunięcie (NIEODWRACALNE)

```sql
-- UWAGA: Usuwa wszystkie dane tenanta. Tylko dla testów/GDPR.
BEGIN;
  -- 1. Usuń dane z schematu tenanta
  DROP SCHEMA "tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" CASCADE;

  -- 2. Usuń customizację
  DELETE FROM shared_config.customization_config
  WHERE tenant_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

  -- 3. Usuń rekord tenanta
  DELETE FROM shared_config.tenants
  WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
COMMIT;
```

---

## 4. Rollback migracji schematu

### Rollback ostatniej migracji dla tenanta

```bash
# Ustaw search_path na schemat tenanta
DATABASE_SCHEMA=tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
  npm run migration:revert --workspace=db-service
```

### Rollback do konkretnej wersji

```bash
# Lista wykonanych migracji
psql $DATABASE_URL -c "
  SELECT * FROM \"tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\".migrations
  ORDER BY timestamp DESC;
"

# Rollback do wybranego punktu (powtarzaj migration:revert)
for i in {1..N}; do
  DATABASE_SCHEMA=tenant_xxx npm run migration:revert --workspace=db-service
done
```

### Backup przed migracją (rekomendowane)

```bash
# Dump całego schematu tenanta
pg_dump \
  --schema="tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  --file="backup_tenant_xxx_$(date +%Y%m%d_%H%M%S).sql" \
  $DATABASE_URL
```

---

## 5. Diagnostyka problemów

### Tenant nie jest rozpoznawany

**Symptom**: Zapytania gRPC nie mają kontekstu tenanta.

```bash
# Sprawdź czy nagłówek x-tenant-id jest przekazywany
# W logach db-service szukaj:
grep "x-tenant-id" /var/log/db-service/*.log

# Sprawdź czy tenant istnieje i jest aktywny
psql $DATABASE_URL -c "
  SELECT id, slug, is_active FROM shared_config.tenants
  WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
"
```

### DataSource nie odpowiada dla tenanta

**Symptom**: Timeout lub błąd połączenia dla konkretnego tenanta.

```bash
# Sprawdź czy schemat istnieje
psql $DATABASE_URL -c "
  SELECT schema_name FROM information_schema.schemata
  WHERE schema_name LIKE 'tenant_%';
"

# Sprawdź aktywne połączenia per schema
psql $DATABASE_URL -c "
  SELECT count(*), state, wait_event_type, wait_event
  FROM pg_stat_activity
  WHERE query LIKE '%tenant_%'
  GROUP BY state, wait_event_type, wait_event;
"
```

### Wyciek danych między tenantami

**Symptom**: Użytkownik tenanta A widzi dane tenanta B.

1. Sprawdź czy `TenantService.getContext()` zwraca właściwy `tenantId`
2. Sprawdź `search_path` w DataSource: `SHOW search_path;`
3. Sprawdź czy zapytania TypeORM nie używają `public` schema bezpośrednio

```sql
-- Sprawdź aktualny search_path sesji
SHOW search_path;

-- Zweryfikuj że tabela users należy do właściwego schematu
SELECT schemaname, tablename
FROM pg_tables
WHERE tablename = 'users'
ORDER BY schemaname;
```

### Cache customizacji przestarzały

```bash
# Wymuś restart serwisu żeby wyczyścić cache in-memory
kubectl rollout restart deployment/bff-service
kubectl rollout restart deployment/core-service

# Lub dla Docker Compose:
docker compose restart bff-service core-service
```

---

## 6. Bezpieczeństwo i izolacja danych

### Zasady izolacji

| Warstwa | Mechanizm | Co chroni |
|---------|-----------|-----------|
| PostgreSQL | Osobny schemat per tenant | Pełna izolacja danych na poziomie DB |
| gRPC | `x-tenant-id` w Metadata | Routing do właściwego schematu |
| AsyncLocalStorage | `TenantService` | Izolacja kontekstu per request/fibre |
| Feature flags | `FeatureFlagGuard` | Kontrola dostępu do funkcji per tenant |

### Audyt dostępu

```sql
-- Kto logował się do systemu w ciągu ostatnich 24h (per tenant)
SELECT
  u.email,
  h.last_ip,
  h.country,
  h.created_at,
  h.mfa_passed,
  h.risk_reasons
FROM "tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".auth_histories h
JOIN "tenant_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".users u ON h.user_id = u.id
WHERE h.created_at > NOW() - INTERVAL '24 hours'
ORDER BY h.created_at DESC;
```

### Rotacja kluczy JWT

Po rotacji klucza JWT wszyscy użytkownicy wszystkich tenantów muszą się zalogować ponownie:

```bash
# Zmień JWT_SECRET w .env i zrestartuj BFF
JWT_SECRET=<new-secret> docker compose restart bff-service
```

---

## 7. Monitoring i alerty

### Kluczowe metryki do monitorowania

| Metryka | Próg alertu | Działanie |
|---------|-------------|-----------|
| DataSource cache miss rate | > 10% | Sprawdź stabilność połączeń |
| `x-tenant-id` missing | > 5% zapytań | Sprawdź konfigurację Handler proxy |
| Schema provisioning failures | > 0 | Sprawdź uprawnienia DB |
| Customization cache evictions | > 20/min | Sprawdź stabilność Redis/pamięci |

### Healthcheck tenanta

```bash
# Sprawdź czy db-service odpowiada dla danego tenanta
curl -H "x-tenant-id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
     http://localhost:3002/health

# Oczekiwana odpowiedź: { "status": "ok", "tenantId": "..." }
```

### Logi diagnostyczne

```bash
# Wszystkie zdarzenia tenant resolution z ostatniej godziny
journalctl -u db-service --since "1 hour ago" | grep "tenant"

# Błędy izolacji schematów
journalctl -u db-service | grep -E "schema|tenant|DataSource" | grep -i error
```

---

*Ostatnia aktualizacja: 2026-04-14*
