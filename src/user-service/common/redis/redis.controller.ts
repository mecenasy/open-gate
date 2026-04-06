import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { RedisService } from './redis.service';
import { RedisEvent } from './model/redis-event';
import { type RedisData, type SaveRedisData, type VerifyRedisData } from './model/redis-data';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @MessagePattern(RedisEvent.Save)
  async save(data: SaveRedisData): Promise<object> {
    await this.redisService.save(data);
    return Promise.resolve({});
  }

  @MessagePattern(RedisEvent.Verify)
  async verify(data: VerifyRedisData): Promise<boolean> {
    return await this.redisService.verify(data);
  }

  @EventPattern(RedisEvent.Remove)
  async remove(data: RedisData) {
    await this.redisService.remove(data);
    return Promise.resolve({});
  }

  @MessagePattern(RedisEvent.CheckExist)
  async checkExist(data: RedisData): Promise<boolean> {
    return await this.redisService.checkExist(data);
  }

  @MessagePattern(RedisEvent.Get)
  async get<T>(data: RedisData): Promise<T | null> {
    return await this.redisService.get<T>(data);
  }
}
