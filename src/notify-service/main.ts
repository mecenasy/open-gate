import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { getGrpcOptions } from 'src/db-service/common/proxy/get-proto-files';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // gRPC server — OutgoingSignalService (gate-service calls this to send Signal messages)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../proto')),
      url: `0.0.0.0:${process.env.GRPC_PORT ?? 50052}`,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003, '0.0.0.0');

  logger.log(`notify-service HTTP running on port ${process.env.PORT ?? 3003}`);
  logger.log(`notify-service gRPC running on port ${process.env.GRPC_PORT ?? 50052}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
