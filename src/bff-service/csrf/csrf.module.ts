import { Module } from '@nestjs/common';
import { CsrfController } from './csrf.controller';
import { CsrfService } from './csrf.service';
import { CsrfGuard } from '../common/guards/csrf.guard';
import { CsrfInterceptor } from './csrf.interceptor';
import { CsrfResolver } from './csrf.resolver';

@Module({
  controllers: [CsrfController],
  providers: [CsrfService, CsrfGuard, CsrfInterceptor, CsrfResolver],
  exports: [CsrfService, CsrfGuard, CsrfInterceptor],
})
export class CsrfModule {}
