import { AggregateRoot } from '@nestjs/cqrs';
import { UserContext } from 'src/gate-service/context/user-context';
import { UnifiedMessage } from 'src/gate-service/message-bridge/platforms/transformer';

export class IdentifyMessageEvent extends AggregateRoot {
  constructor(
    public readonly message: UnifiedMessage,
    public readonly context: UserContext,
  ) {
    super();
  }
}
