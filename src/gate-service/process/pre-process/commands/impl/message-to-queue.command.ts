import { Command } from '@nestjs/cqrs';
import { UserContext } from 'src/gate-service/context/user-context';
import { Status } from 'src/gate-service/status/status';
import { UnifiedMessage } from 'src/gate-service/message-bridge/platforms/transformer';

export class MessageToQueueCommand extends Command<Status> {
  constructor(
    public readonly message: UnifiedMessage,
    public readonly context: UserContext,
  ) {
    super();
  }
}
