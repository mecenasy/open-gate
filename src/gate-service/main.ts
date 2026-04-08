import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { initProxy } from './libs/proxy/proxy';
import { initSession } from './libs/session/init-session';
import { initCorse } from './libs/corse/corse';
import { join } from 'path';
import { getGrpcOptions } from 'src/utils/get-proto-files';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // gRPC server — IncomingSignalService (notify-service calls this to forward Signal messages)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../proto')),
      url: `0.0.0.0:${process.env.SIGNAL_GRPC_PORT ?? 50053}`,
    },
  });

  await initProxy(app);
  await initSession(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  initCorse(app);

  await app.listen(process.env.GATE_PORT || 3002, '0.0.0.0');
  logger.log(`gate-service gRPC (signal) running on port ${process.env.SIGNAL_GRPC_PORT ?? 50053}`);
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
