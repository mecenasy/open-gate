import { Command } from '@nestjs/cqrs';
import { Status } from 'src/gate-service/status/status';
import { Platform } from 'src/gate-service/message-bridge/platform';

export class MessageCommand<T = any> extends Command<Status> {
  constructor(
    public readonly message: T,
    public readonly platform: Platform,
  ) {
    super();
  }
}
