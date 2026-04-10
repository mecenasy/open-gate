import { Global, Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { HttpModule } from '@nestjs/axios';
import { GetawayModule } from './getaway/getaway.module';
import { ConfigsModule } from './configs/configs.module';
import { TypeConfigService } from './configs/types.config.service';
import { ConfigService } from '@nestjs/config';
import { EventService } from './event/event.service';
import { CqrsModule } from '@nestjs/cqrs';
import { DbGrpcModule } from '@app/db-grpc';
import { NotifyGrpcModule } from '@app/notify-grpc';
import { GateGrpcModule } from '@app/gate-grpc';
@Global()
@Module({
  imports: [CqrsModule, RedisModule, DbGrpcModule, NotifyGrpcModule, GateGrpcModule, HttpModule, GetawayModule, ConfigsModule],
  providers: [
    EventService,
    {
      provide: TypeConfigService,
      useExisting: ConfigService,
    },
  ],
  exports: [EventService, TypeConfigService, CqrsModule],
})
export class CommonModule {}
