/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Security } from '../interceptors/security-context.interceptor';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Context } from '../types/context';

export const SecurityContext = createParamDecorator((data: unknown, context: ExecutionContext): Security => {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext<Context>().req;

  return request.securityContext;
});
