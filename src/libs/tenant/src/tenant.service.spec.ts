import { TenantService } from './tenant.service';
import { TenantResolutionSource } from './tenant.types';
import type { TenantContext } from './tenant.types';

const makeCtx = (overrides: Partial<TenantContext> = {}): TenantContext => ({
  tenantId: 'tenant-1',
  tenantSlug: 'acme',
  schemaName: 'tenant_acme',
  correlationId: 'corr-1',
  resolutionSource: TenantResolutionSource.HEADER,
  ...overrides,
});

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(() => {
    service = new TenantService();
  });

  describe('getContext', () => {
    it('returns undefined outside of runInContext', () => {
      expect(service.getContext()).toBeUndefined();
    });

    it('returns context inside runInContext', () => {
      const ctx = makeCtx();
      service.runInContext(ctx, () => {
        expect(service.getContext()).toBe(ctx);
      });
    });

    it('returns undefined after runInContext scope ends', () => {
      const ctx = makeCtx();
      service.runInContext(ctx, () => {
        // inside
      });
      expect(service.getContext()).toBeUndefined();
    });
  });

  describe('getContextOrThrow', () => {
    it('throws UnauthorizedException when no context is set', () => {
      expect(() => service.getContextOrThrow()).toThrow('Tenant context not available');
    });

    it('returns context when set', () => {
      const ctx = makeCtx();
      service.runInContext(ctx, () => {
        expect(service.getContextOrThrow()).toBe(ctx);
      });
    });
  });

  describe('runInContext', () => {
    it('isolates contexts across concurrent runs', (done) => {
      const ctxA = makeCtx({ tenantId: 'tenant-a', tenantSlug: 'aaa' });
      const ctxB = makeCtx({ tenantId: 'tenant-b', tenantSlug: 'bbb' });

      let resolved = 0;

      service.runInContext(ctxA, () => {
        service.runInContext(ctxB, () => {
          expect(service.getContext()?.tenantId).toBe('tenant-b');
          if (++resolved === 2) done();
        });
        expect(service.getContext()?.tenantId).toBe('tenant-a');
        if (++resolved === 2) done();
      });
    });

    it('propagates context through async/await', async () => {
      const ctx = makeCtx({ tenantId: 'async-tenant' });
      await service.runInContext(ctx, async () => {
        await Promise.resolve();
        expect(service.getContext()?.tenantId).toBe('async-tenant');
      });
    });

    it('returns the value from the callback', () => {
      const ctx = makeCtx();
      const result = service.runInContext(ctx, () => 42);
      expect(result).toBe(42);
    });
  });
});
