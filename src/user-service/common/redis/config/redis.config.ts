import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  redisPassword: string;
  redisHost: string;
  redisPort: string;
  redisUri: string;
  grpcServiceUrl: string;
}

export const redisConfig = registerAs(
  'redis',
  (): RedisConfig => ({
    redisPassword: process.env.REDIS_PASSWORD ?? '',
    redisHost: process.env.REDIS_HOST ?? '',
    redisPort: process.env.REDIS_PORT ?? '',
    redisUri: process.env.REDIS_URL ?? '',
    grpcServiceUrl: process.env.GRPC_SERVICE_URL ?? '',
  }),
);
