import { CallHandler, ExecutionContext, ForbiddenException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CsrfGuard } from '../common/guards/csrf.guard';
import { CSRF_EXCLUDE_KEY } from '../common/decorators/csrf.decorator';

@Injectable()
export class CsrfInterceptor implements NestInterceptor {
  constructor(private readonly csrfGuard: CsrfGuard) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = context.getHandler();
    const isExcluded = Reflect.getMetadata(CSRF_EXCLUDE_KEY, handler) as boolean | undefined;

    if (isExcluded) {
      return next.handle();
    }

    const canActivate = this.csrfGuard.canActivate(context);
    if (!canActivate) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return next.handle();
  }
}
