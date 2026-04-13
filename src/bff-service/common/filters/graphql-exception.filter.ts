import { ArgumentsHost, BadRequestException, Catch, HttpException, Injectable } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

interface GqlErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: string;
}

/**
 * GraphQL Exception Filter
 * Catches all unhandled exceptions in GraphQL resolvers
 * Returns standardized error format for GraphQL queries
 */
@Injectable()
@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost): GraphQLError {
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let statusCode = 500;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object') {
        message = ((response as Record<string, unknown>).message as string) || exception.message;
      } else {
        message = response as string;
      }

      code = exception.constructor.name;
    } else if (exception instanceof BadRequestException) {
      statusCode = 400;
      code = 'BAD_REQUEST';
      const response = exception.getResponse();
      if (typeof response === 'object') {
        message = ((response as Record<string, unknown>).message as string) || 'Invalid input';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name || 'UNKNOWN_ERROR';
    }

    const errorResponse: GqlErrorResponse = {
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    return new GraphQLError(JSON.stringify(errorResponse), {
      extensions: {
        code,
        statusCode,
        timestamp: errorResponse.timestamp,
      },
    });
  }
}
