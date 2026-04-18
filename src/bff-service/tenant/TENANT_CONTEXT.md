# Tenant Context in BFF Resolvers

## Rule: tenantId must NEVER come from the frontend

The `tenantId` is a sensitive internal identifier. **Never accept it as a GraphQL argument, mutation input field, or HTTP query parameter from the frontend.** It must always be resolved server-side. The frontend sends no tenant information — the backend derives it entirely from the authenticated session.

---

## NestJS execution order (important)

```text
Middleware → Guards → Interceptors → Pipes → Route handler
```

Guards run **before** interceptors. This matters for tenant resolution.

---

## How the tenant is resolved

### Step 1 — user-state cache (populated at login status fetch)

`LoginStatusHandler` fetches the user's data from gRPC and calls `UserProxyService.getUser` to retrieve `tenantId`. Both are stored together in Redis under `user-state:{userId}` (TTL 1h).

### Step 2 — TenantInterceptor (APP_INTERCEPTOR, runs on every request)

Tries to resolve the tenant in this order:

1. `request.tenantContext` already set (e.g. by `OwnerGuard`) → wraps immediately in AsyncLocalStorage
2. `session.tenant_id` — set directly in the session after login
3. Subdomain — e.g. `my-company.domain.tld`
4. `X-Tenant-Id` header — service-to-service calls
5. Async fallback: reads `user-state:{userId}` from Redis and checks for `tenantId`

When resolved, it does **two things**:

- Ensures `request.tenantContext` is set on the Express request object
- Wraps the downstream handler in `AsyncLocalStorage` via `TenantService.runInContext()`

### Step 3 — OwnerGuard (backup seed)

If the guard fetches `userState.tenantId` from Redis AND `request.tenantContext` is not already set, it seeds `request.tenantContext`. The interceptor then wraps it in AsyncLocalStorage.

---

## Correct pattern for resolvers that need tenantId

Use `TenantService.getContext()?.tenantId`. By the time the resolver runs, the interceptor has established the AsyncLocalStorage context via the user-state cache.

```typescript
@Resolver('Tenant')
export class SomeResolver {
  constructor(private readonly tenantService: TenantService) {}

  @UseGuards(OwnerGuard)
  @Query(() => SomeType)
  someQuery(): Promise<SomeType> {
    const tenantId = this.tenantService.getContext()?.tenantId;
    if (!tenantId) throw new UnauthorizedException('Tenant context not available');
    // use tenantId...
  }
}
```

---

## Summary

| Source | Set by | Read via |
| --- | --- | --- |
| `AsyncLocalStorage` | `TenantInterceptor.runInContext()` | `TenantService.getContext()` |
| `request.tenantContext` | `OwnerGuard` or `TenantInterceptor` | backup — interceptor picks it up |
| `user-state.tenantId` in Redis | `LoginStatusHandler` (fetches via user gRPC) | consumed by `TenantInterceptor` async fallback |

Login → user-state cached with tenantId → interceptor async fallback finds tenantId → AsyncLocalStorage set → resolver calls `getContext()` safely.
