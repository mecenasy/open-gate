import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { getGrpcOptions } from 'src/utils/get-proto-files';
import { join } from 'path';

export const initGateGrpc = (app: INestApplication) => {
  const grpcUrl = process.env.GATE_GRPC_URL ?? 'core-service:50053';
  const port = grpcUrl.split(':')[1] ?? '50053';
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      ...getGrpcOptions(join(__dirname, '../../../proto')),
      url: `0.0.0.0:${port}`,
    },
  });
};
