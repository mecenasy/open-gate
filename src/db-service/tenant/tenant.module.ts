import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entity/tenant.entity';
import { CustomizationConfig } from './entity/customization-config.entity';
import { TenantDbService } from './tenant.service';
import { TenantGrpcInterceptor } from './interceptors/tenant-grpc.interceptor';
import { TenantController } from './tenant.controller';
import { TenantModule } from '@app/tenant';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, CustomizationConfig]), TenantModule],
  controllers: [TenantController],
  providers: [
    TenantDbService,
    TenantGrpcInterceptor,
    { provide: APP_INTERCEPTOR, useClass: TenantGrpcInterceptor },
  ],
  exports: [TypeOrmModule, TenantDbService],
})
export class TenantDbModule {}
