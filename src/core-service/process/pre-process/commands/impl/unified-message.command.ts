import { AggregateRoot } from '@nestjs/cqrs';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

export class UnifiedMessageEvent extends AggregateRoot {
  constructor(public readonly message: UnifiedMessage) {
    super();
  }
}
