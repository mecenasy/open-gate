import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GetawayModule } from './getaway/getaway.module';
import { GraphQlModule } from './graph-ql/graph-ql.module';
import { EventService } from '@app/event';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './guards/user.guard';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeConfigService } from './configs/types.config.service';
import { ConfigsModule } from './configs/configs.module';
import { RedisModule } from '@app/redis';
import { DbGrpcModule } from '@app/db-grpc';
import { NotifyGrpcModule } from '@app/notify-grpc';
@Global()
@Module({
  imports: [
    CqrsModule,
    GraphQlModule,
    RedisModule,
    DbGrpcModule,
    NotifyGrpcModule,
    HttpModule,
    GetawayModule,
    ConfigsModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  providers: [
    EventService,
    {
      provide: TypeConfigService,
      useExisting: ConfigService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [EventService, TypeConfigService, CqrsModule],
})
export class CommonModule {}
