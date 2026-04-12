import { Module } from '@nestjs/common';
import { ProcessMessageSaga } from '../process.saga';
import { commandsHandlers } from './commands/handlers';
import { QueueModule } from '@app/redis';
import { ToQueueBase } from './commands/strategy/to-queue-base';
import { MessageToQueueStrategy } from './commands/strategy/message-to-queue.strategy';
import { CommandToQueueStrategy } from './commands/strategy/command-to-queue.strategy';
import { AudioToQueueStrategy } from './commands/strategy/audio-to-queue.strategy';

@Module({
  imports: [QueueModule],
  providers: [
    ProcessMessageSaga,
    MessageToQueueStrategy,
    CommandToQueueStrategy,
    AudioToQueueStrategy,
    {
      provide: ToQueueBase,

      useFactory: (
        messageStrategy: MessageToQueueStrategy,
        commandStrategy: CommandToQueueStrategy,
        audioStrategy: AudioToQueueStrategy,
      ) => [messageStrategy, commandStrategy, audioStrategy],
      inject: [MessageToQueueStrategy, CommandToQueueStrategy, AudioToQueueStrategy],
    },
    ...commandsHandlers,
  ],
})
export class PreProcessModule {}
