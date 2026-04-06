import { Controller, Get, Res, Session } from '@nestjs/common';
import type { Response } from 'express';
import { CsrfService } from './csrf.service';
import { Public } from '../decorators/public.decorator';
import { ExcludeCsrf } from '../decorators/csrf.decorator';

@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get('token')
  @Public()
  @ExcludeCsrf()
  async getCsrfToken(@Res() res: Response, @Session() session: Record<string, any>) {
    const token = await this.csrfService.generateToken();
    session.csrfToken = token;

    return res.json({ csrfToken: token });
  }
}
