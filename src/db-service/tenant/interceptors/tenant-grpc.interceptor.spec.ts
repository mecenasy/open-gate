import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TenantGrpcInterceptor } from './tenant-grpc.interceptor';
import { TenantService } from '@app/tenant';
import { TenantDbService } from '../tenant.service';
import { Tenant } from '../entity/tenant.entity';
import type { Metadata } from '@grpc/grpc-js';

const makeTenant = (overrides: Partial<Tenant> = {}): Tenant =>
  ({
    id: 'tenant-uuid-1',
    slug: 'acme',
    schemaName: 'tenant_acme',
    customizationId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Tenant;

const makeMetadata = (tenantId?: string, correlationId?: string): Metadata => {
  const values = new Map<string, string[]>();
  if (tenantId) values.set('x-tenant-id', [tenantId]);
  if (correlationId) values.set('x-correlation-id', [correlationId]);

  return {
    get: jest.fn((key: string) => values.get(key) ?? []),
  } as unknown as Metadata;
};

const makeContext = (metadata: Metadata): ExecutionContext =>
  ({
    switchToRpc: jest.fn().mockReturnValue({
      getContext: jest.fn().mockReturnValue(metadata),
    }),
  }) as unknown as ExecutionContext;

const makeHandler = (): CallHandler => ({
  handle: jest.fn().mockReturnValue(of('result')),
});

describe('TenantGrpcInterceptor', () => {
  let interceptor: TenantGrpcInterceptor;
  let tenantService: TenantService;
  let tenantDbService: jest.Mocked<Pick<TenantDbService, 'findById'>>;

  beforeEach(() => {
    tenantService = new TenantService();
    tenantDbService = { findById: jest.fn() };

    interceptor = new TenantGrpcInterceptor(
      tenantService,
      tenantDbService as unknown as TenantDbService,
    );
  });

  it('passes through without context when x-tenant-id header is absent', (done) => {
    const ctx = makeContext(makeMetadata());
    const handler = makeHandler();

    interceptor.intercept(ctx, handler).subscribe({
      complete: () => {
        expect(tenantDbService.findById).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('sets tenant context when x-tenant-id header is present', (done) => {
    const tenant = makeTenant();
    tenantDbService.findById.mockResolvedValue(tenant);

    const ctx = makeContext(makeMetadata('tenant-uuid-1'));
    const handler = makeHandler();
    let capturedCtx: ReturnType<typeof tenantService.getContext>;

    (handler.handle as jest.Mock).mockImplementation(() => {
      capturedCtx = tenantService.getContext();
      return of('ok');
    });

    interceptor.intercept(ctx, handler).subscribe({
      complete: () => {
        expect(capturedCtx).toBeDefined();
        expect(capturedCtx?.tenantId).toBe(tenant.id);
        expect(capturedCtx?.tenantSlug).toBe(tenant.slug);
        expect(capturedCtx?.schemaName).toBe(tenant.schemaName);
        done();
      },
    });
  });

  it('reads correlationId from x-correlation-id metadata', (done) => {
    const tenant = makeTenant();
    tenantDbService.findById.mockResolvedValue(tenant);

    const ctx = makeContext(makeMetadata('tenant-uuid-1', 'corr-abc'));
    const handler = makeHandler();
    let capturedCtx: ReturnType<typeof tenantService.getContext>;

    (handler.handle as jest.Mock).mockImplementation(() => {
      capturedCtx = tenantService.getContext();
      return of('ok');
    });

    interceptor.intercept(ctx, handler).subscribe({
      complete: () => {
        expect(capturedCtx?.correlationId).toBe('corr-abc');
        done();
      },
    });
  });

  it('passes through without context when tenant is not found in DB', (done) => {
    tenantDbService.findById.mockResolvedValue(null);

    const ctx = makeContext(makeMetadata('unknown-tenant'));
    const handler = makeHandler();
    let capturedCtx: ReturnType<typeof tenantService.getContext>;

    (handler.handle as jest.Mock).mockImplementation(() => {
      capturedCtx = tenantService.getContext();
      return of('ok');
    });

    interceptor.intercept(ctx, handler).subscribe({
      complete: () => {
        expect(capturedCtx).toBeUndefined();
        done();
      },
    });
  });

  it('context is available to the handler during execution', (done) => {
    const tenant = makeTenant();
    tenantDbService.findById.mockResolvedValue(tenant);

    const ctx = makeContext(makeMetadata('tenant-uuid-1'));
    const handler = makeHandler();
    let insideContext: ReturnType<typeof tenantService.getContext>;

    (handler.handle as jest.Mock).mockImplementation(() => {
      insideContext = tenantService.getContext();
      return of('ok');
    });

    interceptor.intercept(ctx, handler).subscribe({
      complete: () => {
        expect(insideContext?.tenantId).toBe('tenant-uuid-1');
        done();
      },
    });
  });
});
