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
    logger.error('[redis] Błąd połączenia:', (error as Error)?.stack || error);
  }

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Chrome treats localhost as a secure origin for cookies, but express-session
  // uses X-Forwarded-Proto to detect HTTPS (not the Chrome secure-context rule).
  // Injecting the header here lets Secure+SameSite=none work over plain HTTP on localhost.
  app.use((req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
    const host = req.hostname;
    if (host === 'localhost' || host.endsWith('.localhost')) {
      req.headers['x-forwarded-proto'] = 'https';
    }
    next();
  });

  const sessionCfg = config.getOrThrow<SessionConfig>('session');
  logger.log(
    `[session cookie] secure=${sessionCfg.sessionSecure} sameSite=${sessionCfg.sessionSameSite} httpOnly=${sessionCfg.sessionHttpOnly}`,
  );

  const sessionData = {
    secret: sessionCfg.sessionSecret,
    name: sessionCfg.sessionName,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: sessionCfg.sessionMaxAge,
      httpOnly: sessionCfg.sessionHttpOnly,
      secure: sessionCfg.sessionSecure,
      sameSite: sessionCfg.sessionSameSite,
      domain: sessionCfg.sessionDomain || undefined,
    },
    store: new RedisStore({
      client: redisClient,
      prefix: 'sess:',
      disableTouch: false,
      ttl: config.getOrThrow<SessionConfig>('session').sessionMaxAge / 1000,
    }),
  };

  app.use(session(sessionData));

  logger.log('Sesja zainicjalizowana poprawnie z Redis (redis).');
};
