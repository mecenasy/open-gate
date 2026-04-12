/**
 * Correlation ID Middleware
 * Adds correlation IDs to all requests for distributed tracing
 * Tracks requests across microservices automatically
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuid();

    // Store in request for access in services
    (req as any).correlationId = correlationId;

    // Set response header so client gets the ID
    res.setHeader('x-correlation-id', correlationId);

    // Store in res locals for easy access in handlers
    res.locals.correlationId = correlationId;

    next();
  }
}
