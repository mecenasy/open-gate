import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { initDbGrpc } from '@app/db-grpc';

async function bootstrap() {
  await initDbGrpc(AppModule, { logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
