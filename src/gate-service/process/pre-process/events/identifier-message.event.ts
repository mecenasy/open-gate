import { AggregateRoot } from '@nestjs/cqrs';
import { UserContext } from 'src/gate-service/context/user-context';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

export class IdentifyMessageEvent extends AggregateRoot {
  constructor(
    public readonly message: UnifiedMessage,
    public readonly context: UserContext,
  ) {
    super();
  }
}
