import { AppModule } from './app.module';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { initDbGrpc } from '@app/db-grpc';

async function bootstrap() {
  await initDbGrpc(AppModule, {
    logger: new ConsoleLogger({
      timestamp: false,
    }),
  });
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
