import { Global, Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { HttpModule } from '@nestjs/axios';
import { GetawayModule } from './getaway/getaway.module';
import { ProxyModule } from './proxy/proxy.module';
import { GraphQlModule } from './graph-ql/graph-ql.module';
import { CacheService } from './cache/cache.service';
import { EventService } from './event/event.service';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './guards/user.guard';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeConfigService } from './configs/types.config.service';
import { ConfigsModule } from './configs/configs.module';

@Global()
@Module({
  imports: [
    CqrsModule,
    GraphQlModule,
    RedisModule,
    HttpModule,
    GetawayModule,
    ConfigsModule,
    ProxyModule,
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [CacheService, EventService, TypeConfigService, CqrsModule],
})
export class CommonModule {}
