import { Module } from '@nestjs/common';
import { SignalMessageSaga } from './signal.saga';
import { commandsHandlers } from './commands/handlers';
import { SignalBridgeService } from './signal-bridge.service';
import { QueueModule } from '@app/redis';

@Module({
  imports: [QueueModule],
  controllers: [SignalBridgeService],
  providers: [SignalMessageSaga, ...commandsHandlers],
})
export class SignalModule {}
