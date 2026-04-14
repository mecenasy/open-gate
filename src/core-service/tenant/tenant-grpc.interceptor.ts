import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Metadata } from '@grpc/grpc-js';
import { TenantService, TenantContext, TenantResolutionSource } from '@app/tenant';

/**
 * Lightweight interceptor for core-service gRPC endpoints.
 * Reads x-tenant-id from incoming gRPC metadata and sets AsyncLocalStorage context.
 * No DB validation — core trusts internal callers (notify-service).
 */
@Injectable()
export class TenantGrpcInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantGrpcInterceptor.name);

  constructor(private readonly tenantService: TenantService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = context.switchToRpc().getContext<Metadata>();
    const tenantId = metadata.get?.('x-tenant-id')?.[0] as string | undefined;
    const correlationId = metadata.get?.('x-correlation-id')?.[0] as string | undefined;

    if (!tenantId) {
      return next.handle();
    }

    const ctx: TenantContext = {
      tenantId,
      tenantSlug: '',
      schemaName: `tenant_${tenantId.replace(/-/g, '')}`,
      correlationId: correlationId ?? '',
      resolutionSource: TenantResolutionSource.HEADER,
    };

    this.logger.debug(`Tenant context set: ${tenantId}`);

    return new Observable((subscriber) => {
      this.tenantService.runInContext(ctx, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
