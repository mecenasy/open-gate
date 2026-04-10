import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getGrpcOptions } from 'src/utils/get-proto-files';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { Config } from './config/config';

export const initDbGrpc: typeof NestFactory.createMicroservice = async (module, option) => {
  const logger = new Logger('Bootstrap');

  const appContext = await NestFactory.createApplicationContext(module, option);
  const config = appContext.get(ConfigService);

  const grpcUrl = config.getOrThrow<Config>('db-grpc').grpcUrl;

  await appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(module, {
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../../../proto')),
      url: grpcUrl || '0.0.0.0:50051',
    },
  });

  const url = grpcUrl;
  await app.listen();

  logger.log(`Application is running on: ${url}`);

  return app;
};
