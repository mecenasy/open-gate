import { Command } from '@nestjs/cqrs';
import { Status } from 'src/gate-service/status/status';
import { UnifiedMessage } from 'src/gate-service/message-bridge/platforms/transformer';

export class UnifiedMessageCommand extends Command<Status> {
  constructor(public readonly message: UnifiedMessage) {
    super();
  }
}
