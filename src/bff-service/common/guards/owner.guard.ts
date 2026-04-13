import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CacheService } from '@app/redis';
import { Context } from '@app/auth';
import { UserStatusType } from 'src/bff-service/auth/login/dto/login-status.tape';

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

    return true;
  }
}
