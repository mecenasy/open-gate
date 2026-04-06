import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const getUser = (context: ExecutionContext): string | undefined => {
  return context.switchToHttp().getRequest<Request>().session.user_id;
};
