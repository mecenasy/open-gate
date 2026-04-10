import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SignalBridgeService } from './signal-bridge.service';
import { SignalMessageHandler } from './events/signal-message.handler';
import { NotifyModule } from '../grpc/notify-grpc.module';

@Module({
  imports: [CqrsModule, NotifyModule],
  providers: [SignalBridgeService, SignalMessageHandler],
})
export class SignalModule {}
