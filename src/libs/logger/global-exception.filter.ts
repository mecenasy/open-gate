/**
 * Global Exception Filter
 * Catches all unhandled exceptions and logs them with intelligent error handling
 * Applies to all application endpoints automatically
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from './custom-logger.service';

interface GraphQLErrorExtensions {
  code: string;
  statusCode: number;
  timestamp: string;
}

interface GraphQLErrorBody {
  message: string;
  extensions: GraphQLErrorExtensions;
}

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

    this.logError(exception, request, status);

    // GraphQL requests must respond with HTTP 200 and an `errors` array
    // so Apollo Client treats them as GraphQL errors (allowing e.g. retry
    // links to react), not as a transport-level failure.
    if (host.getType<string>() === 'graphql' && response && typeof response.status === 'function') {
      response.status(HttpStatus.OK).json({ errors: [this.buildGraphQLError(exception, status)] });
      return;
    }

    if (response && typeof response.status === 'function') {
      const errorResponse = this.buildErrorResponse(exception, status, request);
      response.status(status).json(errorResponse);
      return;
    }

    // For microservice and other contexts, let exception propagate
    throw exception;
  }

  private buildGraphQLError(exception: unknown, status: number): GraphQLErrorBody {
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      const resp = exception.getResponse();
      if (typeof resp === 'object' && resp !== null) {
        message = ((resp as Record<string, unknown>).message as string) || exception.message;
      } else {
        message = String(resp);
      }
      code = exception.constructor.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name || 'UNKNOWN_ERROR';
    }

    return {
      message,
      extensions: { code, statusCode: status, timestamp: new Date().toISOString() },
    };
  }

  private buildErrorResponse(exception: unknown, status: number, request: Request): Record<string, unknown> {
    const isProduction = process.env.NODE_ENV === 'production';

    const response: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url || 'unknown',
      method: request?.method || 'unknown',
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
      url: request?.url || 'unknown',
      method: request?.method || 'unknown',
      ip: request?.ip || 'unknown',
      userAgent: request?.headers?.['user-agent'] || 'unknown',
      userId: (request as any)?.user?.id,
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
