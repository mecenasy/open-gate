import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import type { TenantContext } from '../tenant.types';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TenantContext | undefined => {
    try {
      const gqlCtx = GqlExecutionContext.create(context);
      return gqlCtx.getContext<{ req: Request }>().req?.tenantContext;
    } catch {
      return context.switchToHttp().getRequest<Request>().tenantContext;
    }
  },
);
