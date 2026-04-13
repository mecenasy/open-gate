import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { initSession } from './libs/session/init-session';
import { initCorse } from './libs/corse/corse';
import { TypeConfigService } from './common/configs/types.config.service';
import { AppConfig } from './common/configs/app.configs';
import { initRedis, startMicroservices } from '@app/redis';
import { GlobalExceptionFilter, LoggingInterceptor } from '@app/logger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      timestamp: false,
    }),
  });

  app.enableShutdownHooks();

  initRedis(app);
  await startMicroservices(app);
  logger.log('Proxy initialized');

  // Setup global logger filters and interceptors
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
