import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import express from 'express';
import { Observable } from 'rxjs';
import { GeoService, Location } from '../geo/geo.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Context } from '@app/auth';

export interface Security {
  origin: string;
  location: Location;
  userAgent: string;
  fingerprint: string;
}

@Injectable()
export class SecurityContextInterceptor implements NestInterceptor {
  constructor(private readonly geoService: GeoService) {}

  async intercept(context: ExecutionContext, next: CallHandler<Security>): Promise<Observable<Security>> {
    const ctx = GqlExecutionContext.create(context);
    const request: express.Request = ctx.getContext<Context>().req;

    const ip = request.ip;
    const location = this.geoService.getLocation(ip ?? '8.8.8.8');

    request.securityContext = {
      origin: request.headers['origin'] || request.headers['referer'] || '',
      location,
      userAgent: request.headers['user-agent'],
      fingerprint: request.headers['x-fingerprint'],
    };

    return Promise.resolve(next.handle());
  }
}
