import { NestFactory } from '@nestjs/core';
import { TypeConfigService } from './config/types.config.service';
import { GrpcConfig } from 'src/db-service/common/proxy/config/proxy.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getGrpcOptions } from 'src/utils/get-proto-files';
import { join } from 'path';

export const initDbGrpc: typeof NestFactory.createMicroservice = async (module, option) => {
  const appContext = await NestFactory.createApplicationContext(module, option);
  const config = appContext.get(TypeConfigService);

  const grpcUrl = config.getOrThrow<GrpcConfig>('grpc').grpcUrl;

  await appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(module, {
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../../../proto')),
      url: grpcUrl || '0.0.0.0:50051',
    },
  });

  return app;
};
