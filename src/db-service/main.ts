import { AppModule } from './app.module';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { initDbGrpc } from '@app/db-grpc';

async function bootstrap() {
  const app = await initDbGrpc(AppModule, {
    logger: new ConsoleLogger({
      timestamp: false,
    }),
  });

  app.enableShutdownHooks();
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
