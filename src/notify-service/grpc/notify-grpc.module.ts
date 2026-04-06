import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { join } from 'path';
import { OutgoingSignalController } from './outgoing-signal.controller';
import { NotificationController } from './notification.controller';
import { SmsModule } from '../sms/sms.module';
import { SmtpModule } from '../smtp/smtp.module';
import { getGrpcOptions } from 'src/utils/get-proto-files';

/** Token for the gRPC client targeting gate-service IncomingSignalService */
export const GateGrpcKey = Symbol('GateGrpcKey');

@Module({
  imports: [
    HttpModule,
    SmsModule,
    SmtpModule,
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
  controllers: [OutgoingSignalController, NotificationController],
  exports: [ClientsModule],
})
export class NotifyGrpcModule {}
