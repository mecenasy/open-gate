import { registerAs } from '@nestjs/config';

export interface Config {
  redisPassword: string;
  redisHost: string;
  redisPort: string;
  redisUri: string;
}

export const config = registerAs(
  'redis',
  (): Config => ({
    redisPassword: process.env.REDIS_PASSWORD ?? '',
    redisHost: process.env.REDIS_HOST ?? '',
    redisPort: process.env.REDIS_PORT ?? '',
    redisUri: process.env.REDIS_URL ?? '',
  }),
);
