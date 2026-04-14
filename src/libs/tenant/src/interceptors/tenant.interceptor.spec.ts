import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TenantInterceptor } from './tenant.interceptor';
import { TenantService } from '../tenant.service';
import { TenantResolutionSource } from '../tenant.types';
import type { Request } from 'express';

const makeRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    headers: {},
    session: {},
    ...overrides,
  }) as unknown as Request;

const makeContext = (req: Request | null): ExecutionContext => {
  const switchToHttp = jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue(req),
  });
  return {
    switchToHttp,
    getType: jest.fn().mockReturnValue('http'),
  } as unknown as ExecutionContext;
};

const makeHandler = (): CallHandler => ({
  handle: jest.fn().mockReturnValue(of('response')),
});

describe('TenantInterceptor', () => {
  let interceptor: TenantInterceptor;
  let tenantService: TenantService;

  beforeEach(() => {
    tenantService = new TenantService();
    interceptor = new TenantInterceptor(tenantService);
  });

  describe('tenant resolution', () => {
    it('passes through without context when no tenant signals are present', (done) => {
      const req = makeRequest({ headers: {} });
      const ctx = makeContext(req);
      const handler = makeHandler();

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          expect(tenantService.getContext()).toBeUndefined();
          done();
        },
      });
    });

    it('resolves tenant from x-tenant-id header', (done) => {
      const tenantId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
      const req = makeRequest({ headers: { 'x-tenant-id': tenantId } });
      const ctx = makeContext(req);
      const handler = makeHandler();
      let capturedCtx: ReturnType<typeof tenantService.getContext>;

      (handler.handle as jest.Mock).mockImplementation(() => {
        capturedCtx = tenantService.getContext();
        return of('ok');
      });

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          expect(capturedCtx).toBeDefined();
          expect(capturedCtx?.tenantId).toBe(tenantId);
          expect(capturedCtx?.resolutionSource).toBe(TenantResolutionSource.HEADER);
          done();
        },
      });
    });

    it('resolves tenant from session', (done) => {
      const tenantId = 'session-tenant-id';
      const req = makeRequest({ session: { tenant_id: tenantId } as any });
      const ctx = makeContext(req);
      const handler = makeHandler();
      let capturedCtx: ReturnType<typeof tenantService.getContext>;

      (handler.handle as jest.Mock).mockImplementation(() => {
        capturedCtx = tenantService.getContext();
        return of('ok');
      });

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          expect(capturedCtx?.tenantId).toBe(tenantId);
          expect(capturedCtx?.resolutionSource).toBe(TenantResolutionSource.SESSION);
          done();
        },
      });
    });

    it('resolves tenant from subdomain', (done) => {
      const req = makeRequest({ headers: { host: 'acme.app.com' } });
      const ctx = makeContext(req);
      const handler = makeHandler();
      let capturedCtx: ReturnType<typeof tenantService.getContext>;

      (handler.handle as jest.Mock).mockImplementation(() => {
        capturedCtx = tenantService.getContext();
        return of('ok');
      });

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          expect(capturedCtx?.tenantSlug).toBe('acme');
          expect(capturedCtx?.resolutionSource).toBe(TenantResolutionSource.SUBDOMAIN);
          done();
        },
      });
    });

    it('does not resolve www as a tenant subdomain', (done) => {
      const req = makeRequest({ headers: { host: 'www.app.com' } });
      const ctx = makeContext(req);
      const handler = makeHandler();

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          expect(tenantService.getContext()).toBeUndefined();
          done();
        },
      });
    });

    it('gives session priority over subdomain', (done) => {
      const req = makeRequest({
        headers: { host: 'other.app.com' },
        session: { tenant_id: 'session-wins' } as any,
      });
      const ctx = makeContext(req);
      const handler = makeHandler();
      let capturedCtx: ReturnType<typeof tenantService.getContext>;

      (handler.handle as jest.Mock).mockImplementation(() => {
        capturedCtx = tenantService.getContext();
        return of('ok');
      });

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          expect(capturedCtx?.resolutionSource).toBe(TenantResolutionSource.SESSION);
          done();
        },
      });
    });
  });

  describe('context isolation', () => {
    it('does not expose context outside the observable chain', () => {
      // AsyncLocalStorage scope is tested exhaustively in TenantService spec.
      // Here we verify that the interceptor does NOT set context globally
      // (i.e. getContext is undefined before the observable is subscribed to).
      const req = makeRequest({ headers: { 'x-tenant-id': 'isolated-id' } });
      const ctx = makeContext(req);

      // Before subscription: no context
      expect(tenantService.getContext()).toBeUndefined();

      // After creating the observable (but before subscribing): still no context
      interceptor.intercept(ctx, makeHandler());
      expect(tenantService.getContext()).toBeUndefined();
    });
  });
});
