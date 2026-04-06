import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import express from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<express.Request>().user;
    return Boolean(user?.admin);
  }
}
