import { INestApplication } from '@nestjs/common';
import { SessionConfig } from '../../configs/session.config';
import { TypeConfigService } from '../../configs/types.config.service';

export const initCorse = (app: INestApplication) => {
  const config = app.get(TypeConfigService);

  app.enableCors({
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    origin: config.getOrThrow<SessionConfig>('session').allowedOrigin,
    allowedHeaders: ['Content-Type', 'Origin', 'Accept', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
};
