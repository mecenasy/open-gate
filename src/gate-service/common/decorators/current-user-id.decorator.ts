import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getUser } from './helper/get-user';

export const CurrentUserId = createParamDecorator((data: unknown, ctx: ExecutionContext): string | undefined => {
  return getUser(ctx);
});
