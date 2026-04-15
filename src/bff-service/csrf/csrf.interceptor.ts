import { CallHandler, ExecutionContext, ForbiddenException, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { CsrfGuard, CSRF_EXCLUDE_KEY, IS_PUBLIC_KEY } from '@app/auth';

@Injectable()
export class CsrfInterceptor implements NestInterceptor {
  constructor(
    private readonly csrfGuard: CsrfGuard,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = context.getHandler();
    const classRef = context.getClass();

    const isExcluded = this.reflector.getAllAndOverride<boolean>(CSRF_EXCLUDE_KEY, [handler, classRef]);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, classRef]);

    if (isExcluded || isPublic) {
      return next.handle();
    }

    const canActivate = this.csrfGuard.canActivate(context);
    if (!canActivate) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return next.handle();
  }
}
