import { AggregateRoot } from '@nestjs/cqrs';

export class NotificationEvent extends AggregateRoot {
  constructor(
    public readonly phone: string,
    public readonly message: string | Buffer,
    public readonly type: 'text' | 'audio' = 'text',
  ) {
    super();
  }
}
