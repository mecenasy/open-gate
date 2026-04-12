import { AggregateRoot } from '@nestjs/cqrs';
import { Platform } from 'src/notify-service/types/platform';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

export class OutgoingNotifyEvent<T = any> extends AggregateRoot {
  constructor(
    public readonly message: UnifiedMessage<T>,
    public readonly platforms: Platform[],
  ) {
    super();
  }
}
