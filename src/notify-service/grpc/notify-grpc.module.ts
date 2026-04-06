import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { join } from 'path';
import { getGrpcOptions } from 'src/grpc-service/common/proxy/get-proto-files';
import { OutgoingSignalController } from './outgoing-signal.controller';

/** Token for the gRPC client targeting gate-service IncomingSignalService */
export const GateGrpcKey = Symbol('GateGrpcKey');

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: GateGrpcKey,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            ...getGrpcOptions(join(__dirname, '../../proto')),
            url: config.get<string>('GATE_SERVICE_GRPC_URL') ?? 'gate-service:50053',
          },
        }),
      },
    ]),
  ],
  controllers: [OutgoingSignalController],
  exports: [ClientsModule],
})
export class NotifyGrpcModule {}
