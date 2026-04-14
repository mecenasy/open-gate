import { Global, Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { HttpModule } from '@nestjs/axios';
import { GetawayModule } from './getaway/getaway.module';
import { ConfigsModule } from './configs/configs.module';
import { TypeConfigService } from './configs/types.config.service';
import { ConfigService } from '@nestjs/config';
import { EventService } from '@app/event';
import { CqrsModule } from '@nestjs/cqrs';
import { DbGrpcModule } from '@app/db-grpc';
import { NotifyGrpcModule } from '@app/notify-grpc';
import { GateGrpcModule } from '@app/gate-grpc';
import { TenantCustomizationModule } from './customization/tenant-customization.module';
import { TenantModule, TenantService } from '@app/tenant';
import { TENANT_SERVICE_TOKEN } from '@app/handler';
@Global()
@Module({
  imports: [
    CqrsModule,
    RedisModule,
    DbGrpcModule,
    NotifyGrpcModule,
    GateGrpcModule,
    HttpModule,
    GetawayModule,
    ConfigsModule,
    TenantModule,
    TenantCustomizationModule,
  ],
  providers: [
    EventService,
    {
      provide: TypeConfigService,
      useExisting: ConfigService,
    },
    {
      provide: TENANT_SERVICE_TOKEN,
      useExisting: TenantService,
    },
  ],
  exports: [EventService, TypeConfigService, CqrsModule, TenantCustomizationModule, TENANT_SERVICE_TOKEN],
})
export class CommonModule {}
