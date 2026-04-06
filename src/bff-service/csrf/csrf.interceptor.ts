/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CsrfGuard } from '../common/guards/csrf.guard';
import { CSRF_EXCLUDE_KEY } from '../common/decorators/csrf.decorator';

@Injectable()
export class CsrfInterceptor implements NestInterceptor {
  private readonly csrfGuard = new CsrfGuard();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const isExcluded = Reflect.getMetadata(CSRF_EXCLUDE_KEY, handler);

    if (isExcluded) {
      return next.handle();
    }

    const canActivate = this.csrfGuard.canActivate(context);
    if (!canActivate) {
      throw new Error('Invalid CSRF token');
    }

    return next.handle();
  }
}
