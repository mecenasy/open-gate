import { UserContext } from 'src/gate-service/context/user-context';
import { Command } from '@nestjs/cqrs';
import { Status } from 'src/gate-service/status/status';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

export class UserMessageCommand extends Command<Status> {
  constructor(
    public readonly message: UnifiedMessage,
    public readonly context: UserContext,
  ) {
    super();
  }
}
