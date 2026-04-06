import { Module } from '@nestjs/common';
import { CsrfController } from './csrf.controller';
import { CsrfService } from './csrf.service';
import { CsrfInterceptor } from '../interceptors/csrf.interceptor';
import { CsrfGuard } from '../guards/csrf.guard';

@Module({
  controllers: [CsrfController],
  providers: [CsrfService, CsrfGuard, CsrfInterceptor],
  exports: [CsrfService, CsrfGuard, CsrfInterceptor],
})
export class CsrfModule {}
