import { AggregateRoot } from '@nestjs/cqrs';
import { Platform } from 'src/notify-service/types/platform';
import { Type } from 'src/notify-service/types/unified-message';

export interface NotificationEventData {
  phone: string;
  message: string | Buffer;
  platform: Platform;
}

export class NotificationEvent extends AggregateRoot {
  constructor(
    public readonly data: NotificationEventData,
    public readonly type: Type = Type.Text,
  ) {
    super();
  }
}
