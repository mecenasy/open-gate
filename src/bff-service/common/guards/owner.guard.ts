import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CacheService } from '@app/redis';
import { Context } from '@app/auth';
import { UserStatusType } from 'src/bff-service/auth/login/dto/login-status.tape';
import { TenantResolutionSource } from '@app/tenant';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly cache: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext<Context>().req;
    const userId = request.session.user_id;

    if (!userId) {
      throw new ForbiddenException('Access denied');
    }

    const userState = await this.cache.getFromCache<UserStatusType>({
      identifier: userId,
      prefix: 'user-state',
    });

    if (!userState?.owner) {
      throw new ForbiddenException('Access denied: owner role required');
    }

    // Seed tenant context so TenantInterceptor can wrap it in AsyncLocalStorage.
    // Guards run before interceptors in NestJS — this is intentional.
    if (userState.tenantId && !request.tenantContext) {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      request.tenantContext = {
        tenantId: userState.tenantId,
        tenantSlug: '',
        schemaName: `tenant_${userState.tenantId.replace(/-/g, '')}`,
        correlationId,
        resolutionSource: TenantResolutionSource.GUARD,
        userId,
      };
    }

    return true;
  }
}
