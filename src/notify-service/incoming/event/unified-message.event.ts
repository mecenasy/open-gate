import { AggregateRoot } from '@nestjs/cqrs';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

export class UnifiedMessageEvent<T = any> extends AggregateRoot {
  constructor(public readonly message: UnifiedMessage<T>) {
    super();
  }
}
