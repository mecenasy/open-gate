/**
 * Global Exception Filter
 * Catches all unhandled exceptions and logs them with intelligent error handling
 * Applies to all application endpoints automatically
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from './custom-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: CustomLogger;

  constructor() {
    this.logger = new CustomLogger({ serviceId: 'global-exception-filter' });
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = this.buildErrorResponse(exception, status, request);

    // Log the full error internally
    this.logError(exception, request, status);

    // Send minimal response to client
    response.status(status).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, status: number, request: Request): Record<string, unknown> {
    const isProduction = process.env.NODE_ENV === 'production';

    const response: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (!isProduction) {
      if (exception instanceof HttpException) {
        response.message = exception.getResponse();
      } else if (exception instanceof Error) {
        response.message = exception.message;
        response.error = exception.name;
      }
    } else {
      response.message = 'An error occurred while processing your request';
    }

    return response;
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const context = {
      url: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      userId: (request as any).user?.id,
      statusCode: status,
    };

    if (exception instanceof HttpException) {
      this.logger.error(`HTTP Exception: ${status}`, exception, context);
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Error: ${exception.name}`, exception, context);
    } else {
      this.logger.error(`Unknown Error`, new Error(String(exception)), context);
    }
  }
}
