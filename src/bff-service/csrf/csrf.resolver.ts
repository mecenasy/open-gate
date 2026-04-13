import { Resolver, Query, Context } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { CsrfService } from './csrf.service';
import { CsrfTokenType } from './dto/csrf-token.type';
import { Public, ExcludeCsrf } from '@app/auth';
import type { Request } from 'express';
import type { SessionData } from 'express-session';

@Resolver()
export class CsrfResolver {
  constructor(private readonly csrfService: CsrfService) {}

  @Public()
  @Throttle({ public: { limit: 30, ttl: 60000 } })
  @ExcludeCsrf()
  @Query(() => CsrfTokenType)
  async csrfToken(@Context('req') req: Request): Promise<CsrfTokenType> {
    const token = await this.csrfService.generateToken();
    (req.session as SessionData).csrfToken = token;
    return { csrfToken: token };
  }
}
