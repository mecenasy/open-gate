import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeConfigService } from './common/configs/types.config.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getGrpcOptions } from './common/proxy/get-proto-files';
import { join } from 'path';
import { GrpcConfig } from './common/proxy/config/proxy.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const appContext = await NestFactory.createApplicationContext(AppModule);
  const config = appContext.get(TypeConfigService);

  const grpcUrl = config.getOrThrow<GrpcConfig>('grpc').grpcUrl;

  await appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../proto')),
      url: grpcUrl || '0.0.0.0:50051',
    },
  });

  const url = config.getOrThrow<GrpcConfig>('grpc').grpcUrl;
  await app.listen();

  logger.log(`Application is running on: ${url}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('BŁĄD STARTU APLIKACJI:', err);
  process.exit(1);
});
