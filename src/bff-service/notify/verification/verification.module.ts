import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NotifyGrpcModule } from '@app/notify-grpc';
import { GetawayModule } from 'src/bff-service/common/getaway/getaway.module';
import { VerificationBridgeController } from './verification-bridge.controller';
import { VerificationCodeReceivedHandler } from './events/verification-code-received.handler';
import { VerificationConnectFlushService } from './verification-connect-flush.service';

@Module({
  imports: [CqrsModule, GetawayModule, NotifyGrpcModule],
  controllers: [VerificationBridgeController],
  providers: [VerificationCodeReceivedHandler, VerificationConnectFlushService],
})
export class VerificationModule {}
