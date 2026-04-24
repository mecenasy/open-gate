import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { SessionData } from 'express-session';
import { Context } from '../types/context';

interface GraphQLOperation {
  query?: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}

const MUTATING_OPERATION_RE = /^\s*(?:#.*\n\s*)*(mutation|subscription)\b/i;

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

      if (this.isReadOnlyGraphQLOperation(request)) {
        return true;
      }
    }

    const token = (request.headers['x-csrf-token'] ?? request.headers['X-CSRF-Token']) as string;
    const sessionToken = session.csrfToken;

    if (!token || !sessionToken) {
      return false;
    }

    return token === sessionToken;
  }

  private isReadOnlyGraphQLOperation(request: Request): boolean {
    if (!request.body || typeof request.body !== 'object') return false;

    const body = request.body as GraphQLOperation | GraphQLOperation[];
    const ops = Array.isArray(body) ? body : [body];

    return ops.every((op) => typeof op.query === 'string' && !MUTATING_OPERATION_RE.test(op.query));
  }
}
