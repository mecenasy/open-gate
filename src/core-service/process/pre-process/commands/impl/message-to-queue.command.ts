import { Command } from '@nestjs/cqrs';
import { UserContext } from 'src/core-service/context/user-context';
import { Status } from 'src/core-service/status/status';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

export class MessageToQueueCommand extends Command<Status> {
  constructor(
    public readonly message: UnifiedMessage,
    public readonly context: UserContext,
  ) {
    super();
  }
}
