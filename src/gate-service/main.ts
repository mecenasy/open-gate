import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { TypeConfigService } from './configs/types.config.service';
import { AppConfig } from './configs/app.configs';
import { initProxy } from './libs/proxy/proxy';
import { initSession } from './libs/session/init-session';
import { initCorse } from './libs/corse/corse';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  await initProxy(app);
  await initSession(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  initCorse(app);

  const config = app.get(TypeConfigService);
  const url = config.getOrThrow<AppConfig>('app').appUrl;

  await app.listen(process.env.PORT || 3002, '0.0.0.0');

  logger.log(`Application is running on: ${url}`);
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
