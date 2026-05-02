/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { initSession } from './libs/session/init-session';
import { initCorse } from './libs/corse/corse';
import { TypeConfigService } from './common/configs/types.config.service';
import { AppConfig } from './common/configs/app.configs';
import { initRedis, startMicroservices } from '@app/redis';
import { GlobalExceptionFilter, LoggingInterceptor, RequestLoggingMiddleware } from '@app/logger';
import { getGrpcOptions } from 'src/utils/get-proto-files';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      timestamp: false,
    }),
  });

  app.enableShutdownHooks();

  initRedis(app);

  // gRPC server — BffNotifyBridge (notify-service pushes verification codes here)
  const bffGrpcPort = process.env.BFF_GRPC_URL?.split(':').pop() ?? '50054';
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../proto')),
      url: `0.0.0.0:${bffGrpcPort}`,
    },
  });

  await startMicroservices(app);
  logger.log(`Proxy initialized (gRPC listening on 0.0.0.0:${bffGrpcPort})`);

  // Setup request logging middleware
  app.use(new RequestLoggingMiddleware().use.bind(new RequestLoggingMiddleware()));
  logger.log('Request logging middleware initialized');

  // Setup request size limit to prevent DOS attacks
  app.use((req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    const maxSize = process.env.MAX_REQUEST_SIZE || '10mb';
    res.setHeader('X-Max-Content-Length', maxSize);
    next();
  });

  // Configure express bodyParser limits
  const bodyParserJson = require('express').json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' });
  const bodyParserUrlencoded = require('express').urlencoded({
    limit: process.env.MAX_REQUEST_SIZE || '10mb',
    extended: true,
  });
  app.use(bodyParserJson);
  app.use(bodyParserUrlencoded);
  logger.log(`Request size limit set to: ${process.env.MAX_REQUEST_SIZE || '10mb'}`);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await initSession(app);
  logger.log('Session initialized');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  initCorse(app);
  logger.log('CORS initialized');

  const config = app.get(TypeConfigService);
  const url = config.getOrThrow<AppConfig>('app').appUrl;

  await app.listen(process.env.BFF_PORT || 3001, '0.0.0.0');

  logger.log(`Application is running on: ${url}:${process.env.BFF_PORT || 3002}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application:', error);
  process.exit(1);
});
