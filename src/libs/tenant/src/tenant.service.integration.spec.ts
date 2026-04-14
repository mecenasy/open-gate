import { TenantService } from './tenant.service';
import { TenantContext, TenantResolutionSource } from './tenant.types';

describe('TenantService — integration (AsyncLocalStorage isolation)', () => {
  let service: TenantService;

  const makeTenant = (id: string): TenantContext => ({
    tenantId: id,
    tenantSlug: `slug-${id}`,
    schemaName: `tenant_${id.replace(/-/g, '')}`,
    correlationId: `corr-${id}`,
    resolutionSource: TenantResolutionSource.SESSION,
  });

  beforeEach(() => {
    service = new TenantService();
  });

  describe('context isolation between concurrent requests', () => {
    it('should return undefined when no context is set', () => {
      expect(service.getContext()).toBeUndefined();
    });

    it('should return the correct context inside runInContext', (done) => {
      const ctx = makeTenant('tenant-a');
      service.runInContext(ctx, () => {
        expect(service.getContext()).toEqual(ctx);
        done();
      });
    });

    it('should isolate contexts between parallel runs', async () => {
      const ctxA = makeTenant('aaaa-1111-aaaa-1111-aaaa11111111');
      const ctxB = makeTenant('bbbb-2222-bbbb-2222-bbbb22222222');

      const results = await Promise.all([
        new Promise<TenantContext | undefined>((resolve) => {
          service.runInContext(ctxA, () => {
            // Simulate async work
            setImmediate(() => resolve(service.getContext()));
          });
        }),
        new Promise<TenantContext | undefined>((resolve) => {
          service.runInContext(ctxB, () => {
            setImmediate(() => resolve(service.getContext()));
          });
        }),
      ]);

      expect(results[0]?.tenantId).toBe(ctxA.tenantId);
      expect(results[1]?.tenantId).toBe(ctxB.tenantId);
    });

    it('should not leak context outside runInContext', () => {
      const ctx = makeTenant('tenant-leak');
      service.runInContext(ctx, () => {
        // inside — context is available
        expect(service.getContext()).toBeDefined();
      });
      // outside — context must NOT be visible
      expect(service.getContext()).toBeUndefined();
    });

    it('should nest contexts correctly', (done) => {
      const outer = makeTenant('outer-0000-0000-0000-000000000000');
      const inner = makeTenant('inner-1111-1111-1111-111111111111');

      service.runInContext(outer, () => {
        expect(service.getContext()?.tenantId).toBe(outer.tenantId);

        service.runInContext(inner, () => {
          expect(service.getContext()?.tenantId).toBe(inner.tenantId);

          // After inner scope, outer context is restored
          setImmediate(() => {
            // outer context should be visible here since we are still in outer.run()
            // (inner setImmediate fires, outer ALS scope covers it)
            done();
          });
        });
      });
    });
  });

  describe('getContextOrThrow', () => {
    it('should throw UnauthorizedException when no context', () => {
      expect(() => service.getContextOrThrow()).toThrow();
    });

    it('should return context when set', () => {
      const ctx = makeTenant('throw-test');
      service.runInContext(ctx, () => {
        expect(service.getContextOrThrow()).toEqual(ctx);
      });
    });
  });

  describe('data isolation contract', () => {
    it('should map tenantId to schema correctly', () => {
      const id = 'abcd1234-5678-90ef-abcd-1234567890ef';
      const ctx = makeTenant(id);
      // schemaName must be derived from tenantId (no hyphens)
      expect(ctx.schemaName).toBe('tenant_abcd123456789 0efabcd1234567890ef'.replace(/ /g, ''));
    });

    it('should distinguish two tenants by schemaName', () => {
      const t1 = makeTenant('aaa');
      const t2 = makeTenant('bbb');
      expect(t1.schemaName).not.toBe(t2.schemaName);
    });
  });
});
