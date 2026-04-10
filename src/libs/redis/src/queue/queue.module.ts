import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QueueType } from './types';
import { TypeConfigService } from '../config/types.config.service';
import { Config } from '../config/redis.config';
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: TypeConfigService) => ({
        redis: {
          host: configService.get<Config>('redis')?.redisHost ?? '',
          port: Number(configService.get<Config>('redis')?.redisPort ?? 6379),
          password: configService.get<Config>('redis')?.redisPassword ?? '',
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
