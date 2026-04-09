import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getGrpcOptions } from 'src/utils/get-proto-files';
import { join } from 'path';
import { TypeConfigService } from './config/types.config.service';
import { Config } from './config/config';

export const initGateGrpc = (app: INestApplication) => {
  const config = app.get(TypeConfigService);

  const grpcUrl = config.getOrThrow<Config>('grpc').grpcUrl;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../../../proto')),
      url: grpcUrl || '0.0.0.0:50053',
    },
  });
};
