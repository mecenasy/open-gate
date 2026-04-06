import { Module } from '@nestjs/common';
import { CsrfController } from './csrf.controller';
import { CsrfService } from './csrf.service';
import { CsrfGuard } from '../common/guards/csrf.guard';
import { CsrfInterceptor } from './csrf.interceptor';

@Module({
  controllers: [CsrfController],
  providers: [CsrfService, CsrfGuard, CsrfInterceptor],
  exports: [CsrfService, CsrfGuard, CsrfInterceptor],
})
export class CsrfModule {}
