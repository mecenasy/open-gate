import { of, lastValueFrom } from 'rxjs';
import { TenantGrpcInterceptor } from './tenant-grpc.interceptor';
import { TenantService } from '@app/tenant';
import { TenantDbService } from '../tenant.service';
import { TenantResolutionSource } from '@app/tenant';
import type { Tenant } from '@app/entities';

const makeMeta = (tenantId?: string, correlationId?: string) => ({
  get: jest.fn((key: string) => {
    if (key === 'x-tenant-id' && tenantId) return [tenantId];
    if (key === 'x-correlation-id' && correlationId) return [correlationId];
    return [];
  }),
});

const makeContext = (meta: ReturnType<typeof makeMeta>) => ({
  switchToRpc: () => ({
    getContext: () => meta,
  }),
});

const makeHandler = (value: unknown = 'ok') => ({
  handle: () => of(value),
});

describe('TenantGrpcInterceptor — integration', () => {
  let tenantService: TenantService;
  let tenantDbService: jest.Mocked<TenantDbService>;
  let interceptor: TenantGrpcInterceptor;

  const fakeTenant: Partial<Tenant> = {
    id: 'aaaa-bbbb-cccc-dddd-eeeeffffffff',
    slug: 'test-community',
    schemaName: 'tenant_aaaabbbbccccddddeeeeffffffff',
    isActive: true,
  };

  beforeEach(() => {
    tenantService = new TenantService();
    tenantDbService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<TenantDbService>;

    interceptor = new TenantGrpcInterceptor(tenantService, tenantDbService);
  });

  it('should pass through without setting context when no x-tenant-id header', async () => {
    const meta = makeMeta();
    const ctx = makeContext(meta) as never;
    const handler = makeHandler('no-tenant');

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));
    expect(result).toBe('no-tenant');
    expect(tenantService.getContext()).toBeUndefined();
  });

  it('should set TenantContext when valid tenant is found', async () => {
    tenantDbService.findById.mockResolvedValue(fakeTenant as Tenant);

    const meta = makeMeta(fakeTenant.id, 'corr-123');
    const ctx = makeContext(meta) as never;

    let capturedContext: ReturnType<TenantService['getContext']>;
    const handler = {
      handle: () =>
        of(null).pipe(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...([] as any),
        ),
    };

    // Use a custom handler to capture context mid-execution
    const captureHandler = {
      handle: () => {
        capturedContext = tenantService.getContext();
        return of('captured');
      },
    };

    await lastValueFrom(interceptor.intercept(ctx, captureHandler));

    expect(tenantDbService.findById).toHaveBeenCalledWith(fakeTenant.id);
    expect(capturedContext!).toMatchObject({
      tenantId: fakeTenant.id,
      tenantSlug: fakeTenant.slug,
      schemaName: fakeTenant.schemaName,
      correlationId: 'corr-123',
      resolutionSource: TenantResolutionSource.HEADER,
    });
  });

  it('should pass through without context when tenant not found in DB', async () => {
    tenantDbService.findById.mockResolvedValue(null);

    const meta = makeMeta('nonexistent-id');
    const ctx = makeContext(meta) as never;
    const handler = makeHandler('fallback');

    const result = await lastValueFrom(interceptor.intercept(ctx, handler));
    expect(result).toBe('fallback');
  });

  it('should propagate errors from tenantDbService', async () => {
    tenantDbService.findById.mockRejectedValue(new Error('DB connection lost'));

    const meta = makeMeta('some-id');
    const ctx = makeContext(meta) as never;
    const handler = makeHandler();

    await expect(lastValueFrom(interceptor.intercept(ctx, handler))).rejects.toThrow(
      'DB connection lost',
    );
  });

  it('should isolate tenant contexts between concurrent gRPC calls', async () => {
    const tenantA = { ...fakeTenant, id: 'aaaa', slug: 'community-a', schemaName: 'tenant_aaaa' } as Tenant;
    const tenantB = { ...fakeTenant, id: 'bbbb', slug: 'community-b', schemaName: 'tenant_bbbb' } as Tenant;

    tenantDbService.findById
      .mockResolvedValueOnce(tenantA)
      .mockResolvedValueOnce(tenantB);

    const capturedContexts: Array<ReturnType<TenantService['getContext']>> = [];

    const makeCapturingHandler = (delay: number) => ({
      handle: () => {
        return new (jest.requireActual<typeof import('rxjs')>('rxjs').Observable)((sub: import('rxjs').Subscriber<string>) => {
          setTimeout(() => {
            capturedContexts.push(tenantService.getContext());
            sub.next('done');
            sub.complete();
          }, delay);
        });
      },
    });

    const metaA = makeMeta(tenantA.id);
    const metaB = makeMeta(tenantB.id);
    const ctxA = makeContext(metaA) as never;
    const ctxB = makeContext(metaB) as never;

    await Promise.all([
      lastValueFrom(interceptor.intercept(ctxA, makeCapturingHandler(10))),
      lastValueFrom(interceptor.intercept(ctxB, makeCapturingHandler(5))),
    ]);

    const schemaNames = capturedContexts.map((c) => c?.schemaName);
    expect(schemaNames).toContain('tenant_aaaa');
    expect(schemaNames).toContain('tenant_bbbb');
  });
});
