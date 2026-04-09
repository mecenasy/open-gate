import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  redisPassword: string;
  redisHost: string;
  redisPort: string;
  redisUri: string;
  grpcUrl: string;
  notifyGrpcUrl: string;
}

export const redisConfig = registerAs(
  'redis',
  (): RedisConfig => ({
    redisPassword: process.env.REDIS_PASSWORD ?? '',
    redisHost: process.env.REDIS_HOST ?? '',
    redisPort: process.env.REDIS_PORT ?? '',
    redisUri: process.env.REDIS_URL ?? '',
    grpcUrl: process.env.GRPC_CLIENT_URL ?? process.env.GRPC_URL ?? '',
    notifyGrpcUrl: process.env.NOTIFY_SERVICE_GRPC_URL ?? 'notify-service:50052',
  }),
);
