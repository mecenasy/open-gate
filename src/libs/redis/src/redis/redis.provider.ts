/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createClient } from 'redis';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';
import { RedisClientKey } from './redis-keys';

config();

interface SocketOption {
  tls: true;
  rejectUnauthorized: boolean;
}

export const redisProvider = {
  provide: RedisClientKey,
  useFactory: async () => {
    const logger = new Logger('RedisProvider');
    const redisUri = process.env.REDIS_URL?.trim();

    if (!redisUri) {
      logger.error('❌ [RedisProvider] REDIS_URL is missing in environment variables!');
      throw new Error('Environment variable REDIS_URL is not defined');
    }

    const isTls = redisUri.startsWith('rediss');
    const socketOptions: SocketOption = {
      tls: true,
      rejectUnauthorized: false,
    };

    const client = createClient({
      url: redisUri,
      socket: {
        ...(isTls ? socketOptions : {}),
        connectTimeout: 5000,
        keepAlive: true,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            logger.error(`❌ [RedisProvider] Too many retries (${retries}), giving up`);
            return new Error('Redis connection failed after 3 retries');
          }
          return Math.min(retries * 500, 2000);
        },
      },
      commandsQueueMaxLength: parseInt(process.env.REDIS_QUEUE_MAX ?? '500'),
    });

    client.on('error', (err) => {
      logger.error('❌ [RedisProvider] Client Error:', err?.message || err);
    });

    try {
      await client.connect();
      logger.log('✅ [RedisProvider] Connected successfully to:', redisUri.split('@')[1]);
      return client;
    } catch (error) {
      logger.error('❌ [RedisProvider] Connection failed:', (error as Error)?.message || error);
      throw error;
    }
  },
};
