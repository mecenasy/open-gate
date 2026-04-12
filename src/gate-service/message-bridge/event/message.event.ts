import { AggregateRoot } from '@nestjs/cqrs';
import { Platform } from 'src/gate-service/message-bridge/platform';

export class MessageEvent<T = any> extends AggregateRoot {
  constructor(
    public readonly message: T,
    public readonly platform: Platform,
  ) {
    super();
  }
}
