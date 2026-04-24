import { Logger } from '@nestjs/common';
import { Resolver, Query, Context } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { CsrfService } from './csrf.service';
import { CsrfTokenType } from './dto/csrf-token.type';
import { Public, ExcludeCsrf } from '@app/auth';
import type { Request } from 'express';
import type { SessionData } from 'express-session';
import { saveSession } from 'src/bff-service/auth/helpers/save-session';

@Resolver()
export class CsrfResolver {
  private readonly logger = new Logger(CsrfResolver.name);

  constructor(private readonly csrfService: CsrfService) {}

  @Public()
  @Throttle({ public: { limit: 30, ttl: 60000 } })
  @ExcludeCsrf()
  @Query(() => CsrfTokenType)
  async csrfToken(@Context('req') req: Request): Promise<CsrfTokenType> {
    const token = this.csrfService.generateToken();
    const session = req.session as SessionData;
    session.csrfToken = token;
    await saveSession(session, this.logger);
    return { csrfToken: token };
  }
}
