/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { INestApplication, Logger } from '@nestjs/common';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';
import { SessionConfig } from 'src/bff-service/common/configs/session.config';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';

export const initSession = async (app: INestApplication) => {
  const logger = new Logger('SessionInit');
  const config = app.get(TypeConfigService);
  const redisUri = process.env.REDIS_URL ?? '';

  const redisClient = createClient({
    url: redisUri,
    socket: redisUri.startsWith('rediss') ? { tls: true, rejectUnauthorized: false } : {},
  });

  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('[redis] Błąd połączenia:', error?.stack || error);
  }

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(
    session({
      secret: config.getOrThrow<SessionConfig>('session').sessionSecret,
      name: config.getOrThrow<SessionConfig>('session').sessionName,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: config.getOrThrow<SessionConfig>('session').sessionMaxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: redisUri.startsWith('rediss') ? 'none' : 'lax',
      },
      store: new RedisStore({
        client: redisClient,
        prefix: 'sess:',
        disableTouch: false,
        ttl: config.getOrThrow<SessionConfig>('session').sessionMaxAge / 1000,
      }),
    }),
  );

  logger.log('Sesja zainicjalizowana poprawnie z Redis (redis).');
};
