/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    } else {
      message = 'Unknown error';
      this.logger.error(`Unknown exception: ${JSON.stringify(exception)}`);
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      ...(error && { error }),
      timestamp: new Date().toISOString(),
      path: request?.url,
    };

    response.status(statusCode).json(errorResponse);
  }
}
