import { Controller, Get, Res, Session } from '@nestjs/common';
import type { Response } from 'express';
import { CsrfService } from './csrf.service';
import { Public, ExcludeCsrf } from '@app/auth';

@Controller('csrf')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get('token')
  @Public()
  @ExcludeCsrf()
  getCsrfToken(@Res() res: Response, @Session() session: Record<string, any>) {
    const token = this.csrfService.generateToken();
    session.csrfToken = token;

    return res.json({ csrfToken: token });
  }
}
