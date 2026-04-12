/**
 * Logging Interceptor
 * Tracks request/response lifecycle with timing information
 * Useful for performance monitoring and tracing
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CustomLogger } from './custom-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: CustomLogger;

  constructor() {
    this.logger = new CustomLogger({ serviceId: 'logging-interceptor' });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    this.logger.setContext(`${method} ${url}`);
    this.logger.debug('Request started');

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.debug(`Request completed (${duration}ms)`);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(`Request failed (${duration}ms)`, error);
        throw error;
      }),
    );
  }
}
