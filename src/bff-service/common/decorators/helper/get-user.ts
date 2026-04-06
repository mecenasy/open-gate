import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Context } from 'src/common/types/context';

export const getUser = (context: ExecutionContext): string | undefined => {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext<Context>().req;

  return request?.session?.user_id;
};
