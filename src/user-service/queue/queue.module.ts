import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { QueueService } from './queue.service';
import { TypeConfigService } from '../configs/types.config.service';
import { RedisConfig } from '../common/redis/config/redis.config';
import { QueueType } from './types';
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: TypeConfigService) => ({
        redis: {
          host: configService.get<RedisConfig>('redis')?.redisHost ?? '',
          port: Number(configService.get<RedisConfig>('redis')?.redisPort ?? 6379),
          password: configService.get<RedisConfig>('redis')?.redisPassword ?? '',
        },
      }),
      inject: [TypeConfigService],
    }),
    BullModule.registerQueue(
      { name: QueueType.Command },
      { name: QueueType.Message },
      { name: QueueType.Attachment },
      { name: QueueType.Transcription },
      { name: QueueType.Speech },
    ),
  ],
  providers: [QueueService],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
