import { Global, Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { GetawayModule } from './getaway/getaway.module';
import { ConfigsModule } from '../configs/configs.module';
import { ProxyModule } from './proxy/proxy.module';
import { TypeConfigService } from '../configs/types.config.service';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache/cache.service';
import { EventService } from './event/event.service';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { SignalGrpcModule } from './signal-grpc.module';

@Global()
@Module({
  imports: [
    CqrsModule,
    RedisModule,
    HttpModule,
    GetawayModule,
    ConfigsModule,
    ProxyModule,
    SignalGrpcModule,
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
    CacheService,
    EventService,
    {
      provide: TypeConfigService,
      useExisting: ConfigService,
    },
  ],
  exports: [CacheService, EventService, TypeConfigService, CqrsModule, SignalGrpcModule],
})
export class CommonModule {}
