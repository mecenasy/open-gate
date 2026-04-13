import { Resolver, Query, Context } from '@nestjs/graphql';
import { CsrfService } from './csrf.service';
import { CsrfTokenType } from './dto/csrf-token.type';
import { Public } from '../common/decorators/public.decorator';
import { ExcludeCsrf } from '../common/decorators/csrf.decorator';
import type { Request } from 'express';
import type { SessionData } from 'express-session';

@Resolver()
export class CsrfResolver {
  constructor(private readonly csrfService: CsrfService) {}

  @Public()
  @ExcludeCsrf()
  @Query(() => CsrfTokenType)
  async csrfToken(@Context('req') req: Request): Promise<CsrfTokenType> {
    const token = await this.csrfService.generateToken();
    (req.session as SessionData).csrfToken = token;
    return { csrfToken: token };
  }
}
