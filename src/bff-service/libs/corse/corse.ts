import { INestApplication } from '@nestjs/common';
import { SessionConfig } from 'src/bff-service/common/configs/session.config';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';

export const initCorse = (app: INestApplication) => {
  const config = app.get(TypeConfigService);
  const allowedOrigin = config.getOrThrow<SessionConfig>('session').allowedOrigin;

  app.enableCors({
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    origin: (origin: string, callback: (er: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isConfiguredOrigin = origin === allowedOrigin;
      const isLocalhost = /^https?:\/\/([\w-]+\.)*localhost(:\d+)?$/.test(origin);
      const is127 = /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

      if (isConfiguredOrigin || isLocalhost || is127) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: ['Content-Type', 'Origin', 'Accept', 'Authorization', 'X-CSRF-Token', 'X-Correlation-Id'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
};
