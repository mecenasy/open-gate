import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { getGrpcOptions } from 'src/utils/get-proto-files';
import { GlobalExceptionFilter, LoggingInterceptor } from '@app/logger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      timestamp: false,
    }),
  });

  app.enableShutdownHooks();

  // gRPC server — OutgoingSignalService (core-service calls this to send Signal messages)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../proto')),
      url: `0.0.0.0:${process.env.NOTIFY_GRPC_URL?.split(':').pop() ?? '50052'}`,
    },
  });
  // Twilio (and most webhook providers) send form-urlencoded — Nest's
  // default body parser handles JSON only, so wire urlencoded here too.
  // 1mb is plenty: a Twilio SMS webhook is ~2kb of fields.
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ limit: '1mb', extended: true }));

  // Setup global logger filters and interceptors
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.startAllMicroservices();
  await app.listen(process.env.NOTIFY_PORT ?? 3003, '0.0.0.0');

  logger.log(`notify-service HTTP running on port ${process.env.PORT ?? 3003}`);
  logger.log(`notify-service gRPC running on port ${process.env.GRPC_PORT ?? 50052}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
