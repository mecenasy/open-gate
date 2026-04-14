/**
 * Request/Response Logging Middleware
 * Logs incoming HTTP requests and outgoing responses with detailed metadata
 * Useful for debugging, monitoring, and audit trails
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from './custom-logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger: CustomLogger;

  constructor() {
    this.logger = new CustomLogger({ serviceId: 'request-logging' });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const method = req.method;
    const originalUrl = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    // Log incoming request
    this.logger.log(
      `[${method}] ${originalUrl}`,
      {
        method,
        path: req.path,
        query: req.query,
        ip,
        userAgent,
        userId: (req as any).user?.id,
      },
    );

    // Capture original response methods
    const originalSend = res.send;
    const logger = this.logger;

    // Override res.send to capture response
    res.send = function (data: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log outgoing response
      const logFn = statusCode >= 400 ? 'warn' : 'log';
      (logger as any)[logFn](
        `[${method}] ${originalUrl} - ${statusCode}`,
        {
          method,
          path: req.path,
          statusCode,
          duration: `${duration}ms`,
          ip,
          userAgent,
          userId: (req as any).user?.id,
          contentLength: res.get('content-length'),
        },
        'outgoing-response',
      );

      // Call original send
      res.send = originalSend;
      return originalSend.call(this, data);
    }.bind(res);

    next();
  }
}
