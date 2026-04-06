import { Global, Module } from '@nestjs/common';
import { redisProvider } from './redis.provider';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';

@Global()
@Module({
  providers: [redisProvider, RedisService],
  exports: [RedisService],
  controllers: [RedisController],
})
export class RedisModule {}
