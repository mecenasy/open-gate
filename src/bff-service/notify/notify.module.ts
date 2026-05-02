import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { VerificationModule } from './verification/verification.module';
import { notifyEventHandlers } from './common/handlers';

@Module({
  imports: [SocketModule, VerificationModule],
  providers: [...notifyEventHandlers],
})
export class NotifyModule {}
