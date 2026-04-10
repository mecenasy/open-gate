import { TypeConfigService } from './config/types.config.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getGrpcOptions } from 'src/utils/get-proto-files';
import { join } from 'path';
import { INestApplication } from '@nestjs/common';
import { Config } from './config/config';

export const initNotifyGrpc = (app: INestApplication) => {
  const config = app.get(TypeConfigService);

  const grpcUrl = config.getOrThrow<Config>('notify-grpc').grpcUrl;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../../../proto')),
      url: grpcUrl || '0.0.0.0:50052',
    },
  });
};
