export { RedisKey } from './redis-keys';
export type { RedisConfig } from './config/redis.config';
export { redisConfig } from './config/redis.config';
export * from './init-proxy';

export * from './cache/cache.service';
export * from './redis.service';

export * from './redis.module';
export * from './queue/queue.service';
export * from './queue/types';

export type { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
