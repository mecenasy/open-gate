import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import express from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<express.Request>().user;
    //TODO: Implement actual admin check logic here, for now we just check if user exists
    return Boolean(user);
  }
}
