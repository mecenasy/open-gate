import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { initProxy } from './libs/proxy/proxy';
import { initSession } from './libs/session/init-session';
import { initCorse } from './libs/corse/corse';
import { TypeConfigService } from './common/configs/types.config.service';
import { AppConfig } from './common/configs/app.configs';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  logger.log('Initializing proxy...');
  await initProxy(app);
  logger.log('Proxy initialized');

  logger.log('Initializing session...');
  await initSession(app);
  logger.log('Session initialized');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  logger.log('Initializing CORS...');
  initCorse(app);
  logger.log('CORS initialized');

  const config = app.get(TypeConfigService);
  const url = config.getOrThrow<AppConfig>('app').appUrl;

  await app.listen(process.env.PORT || 3000, '0.0.0.0');

  logger.log(`Application is running on: ${url}:${process.env.PORT || 3000}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application:', error);
  process.exit(1);
});
