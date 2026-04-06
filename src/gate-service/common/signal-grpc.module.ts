import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { getGrpcOptions } from 'src/db-service/common/proxy/get-proto-files';

/** Token for the gRPC client targeting notify-service OutgoingSignalService */
export const NotifyGrpcKey = Symbol('NotifyGrpcKey');

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NotifyGrpcKey,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            ...getGrpcOptions(join(__dirname, '../../proto')),
            url: config.get<string>('NOTIFY_SERVICE_GRPC_URL') ?? 'notify-service:50052',
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SignalGrpcModule {}
