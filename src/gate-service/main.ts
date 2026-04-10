import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { initGateGrpc } from '@app/gate-grpc';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  initGateGrpc(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(process.env.GATE_PORT || 3002, '0.0.0.0');
  logger.log(`gate-service gRPC (signal) running on port ${process.env.SIGNAL_GRPC_PORT ?? 50053}`);
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
