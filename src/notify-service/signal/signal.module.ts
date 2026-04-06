import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SignalBridgeService } from './signal-bridge.service';
import { SignalMessageHandler } from './events/signal-message.handler';
import { NotifyGrpcModule } from '../grpc/notify-grpc.module';

@Module({
  imports: [CqrsModule, NotifyGrpcModule],
  providers: [SignalBridgeService, SignalMessageHandler],
})
export class SignalModule {}
