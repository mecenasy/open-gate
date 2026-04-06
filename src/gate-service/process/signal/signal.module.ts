import { Module } from '@nestjs/common';
import { SignalMessageSaga } from './signal.saga';
import { commandsHandlers } from './commands/handlers';
import { SignalBridgeService } from './signal-bridge.service';
import { QueueModule } from 'src/user-service/queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [SignalBridgeService, SignalMessageSaga, ...commandsHandlers],
})
export class SignalModule {}
