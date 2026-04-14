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
import { TenantModule } from '@app/tenant';
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
  ],
  exports: [EventService, TypeConfigService, CqrsModule, TenantCustomizationModule],
})
export class CommonModule {}
