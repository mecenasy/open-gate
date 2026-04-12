import { AggregateRoot } from '@nestjs/cqrs';
import { Platform } from '../../types/platform';
import { UnifiedMessage } from 'src/notify-service/types/unified-message';

export class AttachmentEvent extends AggregateRoot {
  constructor(
    public readonly message: UnifiedMessage,
    public readonly platform: Platform,
  ) {
    super();
  }
}
