import { AggregateRoot } from '@nestjs/cqrs';
import { UnifiedMessage } from '../platforms/transformer';

export class UnifiedMessageEvent<T = any> extends AggregateRoot {
  constructor(public readonly message: UnifiedMessage<T>) {
    super();
  }
}
