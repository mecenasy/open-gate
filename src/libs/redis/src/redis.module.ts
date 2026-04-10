import { Global, Module } from '@nestjs/common';
import { redisProvider } from './redis.provider';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { ConfigsModule } from './config/configs.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisKey } from './redis-keys';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeConfigService } from './config/types.config.service';
import { Config } from './config/redis.config';
import { CacheService } from './cache/cache.service';
import { QueueModule } from './queue/queue.module';

@Global()
@Module({
  imports: [
    ConfigsModule,
    QueueModule,
    ClientsModule.registerAsync([
      {
        name: RedisKey,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: TypeConfigService) => {
          const redisUri = configService.getOrThrow<Config>('redis')?.redisUri;
          const tls = redisUri.startsWith('rediss') ? { rejectUnauthorized: false } : undefined;

          return {
            transport: Transport.REDIS,
            options: {
              host: configService.get<Config>('redis')?.redisHost,
              port: +(configService.get<Config>('redis')?.redisPort ?? 0),
              password: configService.get<Config>('redis')?.redisPassword,
              tls,
            },
          };
        },
      },
    ]),
  ],
  providers: [
    redisProvider,
    RedisService,
    CacheService,
    {
      provide: TypeConfigService,
      useExisting: ConfigService,
    },
  ],
  exports: [ClientsModule, TypeConfigService, RedisService, CacheService],
  controllers: [RedisController],
})
export class RedisModule {}
