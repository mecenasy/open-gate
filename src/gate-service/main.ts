import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { initGateGrpc } from '@app/gate-grpc';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      timestamp: false,
    }),
  });

  initGateGrpc(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(process.env.GATE_PORT || 3002, '0.0.0.0');
  logger.log(`gate-service gRPC (signal) running on port  50053`);
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
