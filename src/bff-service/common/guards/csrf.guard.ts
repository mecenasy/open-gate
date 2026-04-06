import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { SessionData } from 'express-session';
import { Context } from 'src/common/types/context';

interface GraphQLOperation {
  query?: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let request: Request;
    let session: SessionData;

    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest<Request>();
      session = request.session as SessionData;

      if (request.method === 'GET') {
        return true;
      }
    } else {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext<Context>().req;
      session = request.session as SessionData;

      if (this.isGraphQLQuery(request)) {
        return true;
      }
    }

    const token = request.headers['X-CSRF-Token'] as string;
    const sessionToken = session.csrfToken;

    if (!token || !sessionToken) {
      return false;
    }

    return token === sessionToken;
  }

  private isGraphQLQuery(request: Request): boolean {
    // Check if this is a GraphQL request
    if (request.body && typeof request.body === 'object') {
      const body = request.body as GraphQLOperation | GraphQLOperation[];

      // Check for single query operation
      if ('query' in body && typeof body.query === 'string') {
        const query = body.query.trim().toLowerCase();
        return query.startsWith('query') && !query.includes('mutation') && !query.includes('subscription');
      }

      // Check for batched operations
      if (Array.isArray(body)) {
        return body.every(
          (op) =>
            op.query &&
            typeof op.query === 'string' &&
            op.query.trim().toLowerCase().startsWith('query') &&
            !op.query.includes('mutation') &&
            !op.query.includes('subscription'),
        );
      }
    }

    return false;
  }
}
