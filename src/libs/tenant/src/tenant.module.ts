import { Global, Module } from '@nestjs/common';
import { TenantService } from './tenant.service.js';
import { TenantInterceptor } from './interceptors/tenant.interceptor.js';

@Global()
@Module({
  providers: [TenantService, TenantInterceptor],
  exports: [TenantService, TenantInterceptor],
})
export class TenantModule {}
