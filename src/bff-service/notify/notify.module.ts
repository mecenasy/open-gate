import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { notifyEventHandlers } from './common/handlers';

@Module({
  imports: [SocketModule],
  providers: [...notifyEventHandlers],
})
export class NotifyModule {}
