import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { ExcludeCsrf } from './common/decorators/csrf.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ExcludeCsrf()
  getHello(): string {
    return this.appService.getHello();
  }
}
