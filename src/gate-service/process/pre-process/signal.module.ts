import { Module } from '@nestjs/common';
import { ProcessMessageSaga } from '../process.saga';
import { commandsHandlers } from './commands/handlers';
import { SignalBridgeService } from '../../message-bridge/platforms/signal/signal-bridge.controler';
import { QueueModule } from '@app/redis';
import { ToQueueBase } from './commands/strategy/to-queue-base';
import { AudioToQueueStrategy } from './commands/strategy/audio-to-queue.strategy';
import { MessageToQueueStrategy } from './commands/strategy/message-to-queue.strategy';
import { CommandToQueueStrategy } from './commands/strategy/command-to-queue.strategy';

@Module({
  imports: [QueueModule],
  controllers: [SignalBridgeService],
  providers: [
    ProcessMessageSaga,
    AudioToQueueStrategy,
    MessageToQueueStrategy,
    CommandToQueueStrategy,
    {
      provide: ToQueueBase,
      useFactory: (
        audioStrategy: AudioToQueueStrategy,
        messageStrategy: MessageToQueueStrategy,
        commandStrategy: CommandToQueueStrategy,
      ) => [audioStrategy, messageStrategy, commandStrategy],
      inject: [AudioToQueueStrategy, MessageToQueueStrategy, CommandToQueueStrategy],
    },
    ...commandsHandlers,
  ],
})
export class SignalModule {}
