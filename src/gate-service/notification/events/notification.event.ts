import { AggregateRoot } from '@nestjs/cqrs';
import { Platform } from 'src/notify-service/types/platform';

export class NotificationEvent extends AggregateRoot {
  constructor(
    public readonly phone: string,
    public readonly message: string | Buffer,
    public readonly platform: Platform,
    public readonly type: 'text' | 'audio' = 'text',
  ) {
    super();
  }
}
