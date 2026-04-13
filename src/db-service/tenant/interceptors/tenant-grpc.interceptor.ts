import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Metadata } from '@grpc/grpc-js';
import { TenantContext, TenantResolutionSource, TenantService } from '@app/tenant';
import { TenantDbService } from '../tenant.service';

@Injectable()
export class TenantGrpcInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantService: TenantService,
    private readonly tenantDbService: TenantDbService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = context.switchToRpc().getContext<Metadata>();
    const values = metadata.get?.('x-tenant-id');
    const tenantId = values?.[0] as string | undefined;

    if (!tenantId) {
      return next.handle();
    }

    return new Observable((subscriber) => {
      void this.tenantDbService
        .findById(tenantId)
        .then((tenant) => {
          if (!tenant) {
            next.handle().subscribe(subscriber);
            return;
          }

          const ctx: TenantContext = {
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
            schemaName: tenant.schemaName,
            correlationId: (metadata.get('x-correlation-id')?.[0] as string | undefined) ?? '',
            resolutionSource: TenantResolutionSource.HEADER,
          };

          this.tenantService.runInContext(ctx, () => {
            next.handle().subscribe(subscriber);
          });
        })
        .catch((err: unknown) => subscriber.error(err));
    });
  }
}
