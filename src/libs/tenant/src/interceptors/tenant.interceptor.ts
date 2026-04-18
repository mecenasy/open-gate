import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor, Optional } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { from, Observable, switchMap } from 'rxjs';
import type { Request } from 'express';
import { TenantService } from '../tenant.service';
import { TenantContext, TenantResolutionSource } from '../tenant.types';
import { CacheService } from '@app/redis';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantInterceptor.name);

  constructor(
    private readonly tenantService: TenantService,
    @Optional() private readonly cacheService?: CacheService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = this.extractRequest(context);

    if (!request) {
      return next.handle();
    }

    // Context already set by a guard (guards run before interceptors).
    if (request.tenantContext) {
      return this.runInContext(request.tenantContext, next);
    }

    const syncContext = this.resolveTenantSync(request);

    if (syncContext) {
      request.tenantContext = syncContext;
      return this.runInContext(syncContext, next);
    }

    // Fallback: resolve tenant from cached user state when only user_id is in session
    const userId = request.session?.user_id;
    if (!userId || !this.cacheService) {
      return next.handle();
    }

    return from(this.resolveTenantFromCache(userId, request)).pipe(
      switchMap((tenantContext) => {
        if (!tenantContext) return next.handle();
        request.tenantContext = tenantContext;
        return this.runInContext(tenantContext, next);
      }),
    );
  }

  private runInContext(tenantContext: TenantContext, next: CallHandler): Observable<unknown> {
    return new Observable((subscriber) => {
      this.tenantService.runInContext(tenantContext, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }

  private async resolveTenantFromCache(userId: string, request: Request): Promise<TenantContext | null> {
    try {
      const userState = await this.cacheService!.getFromCache<{ tenantId?: string }>({
        identifier: userId,
        prefix: 'user-state',
      });
      if (!userState?.tenantId) return null;
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      return {
        tenantId: userState.tenantId,
        tenantSlug: '',
        schemaName: `tenant_${userState.tenantId.replace(/-/g, '')}`,
        correlationId,
        resolutionSource: TenantResolutionSource.SESSION,
        userId,
      };
    } catch {
      return null;
    }
  }

  private extractRequest(context: ExecutionContext): Request | null {
    try {
      const gqlCtx = GqlExecutionContext.create(context);
      const req = gqlCtx.getContext<{ req: Request }>().req;
      if (req) return req;
    } catch {
      // not a GraphQL context
    }

    try {
      return context.switchToHttp().getRequest<Request>();
    } catch {
      return null;
    }
  }

  private resolveTenantSync(request: Request): TenantContext | null {
    const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();

    // 1. Session: set after login
    const sessionTenantId = request.session?.tenant_id;
    if (sessionTenantId) {
      return {
        tenantId: sessionTenantId,
        tenantSlug: '',
        schemaName: `tenant_${sessionTenantId.replace(/-/g, '')}`,
        correlationId,
        resolutionSource: TenantResolutionSource.SESSION,
        userId: request.session?.user_id,
      };
    }

    // 2. Subdomain: {slug}.domain.tld
    const host = (request.headers.host ?? '').split(':')[0];
    const subdomainMatch = /^([a-z0-9-]+)\.(?:[^.]+\.[^.]+|localhost)$/.exec(host);
    if (subdomainMatch && subdomainMatch[1] !== 'www') {
      const slug = subdomainMatch[1];
      this.logger.debug(`Resolved tenant from subdomain: ${slug}`);
      return {
        tenantId: '',
        tenantSlug: slug,
        schemaName: `tenant_${slug}`,
        correlationId,
        resolutionSource: TenantResolutionSource.SUBDOMAIN,
        userId: request.session?.user_id,
      };
    }

    // 3. X-Tenant-Id header (service-to-service)
    const headerTenantId = request.headers['x-tenant-id'] as string | undefined;
    if (headerTenantId) {
      return {
        tenantId: headerTenantId,
        tenantSlug: '',
        schemaName: `tenant_${headerTenantId.replace(/-/g, '')}`,
        correlationId,
        resolutionSource: TenantResolutionSource.HEADER,
        userId: request.session?.user_id,
      };
    }

    return null;
  }
}
