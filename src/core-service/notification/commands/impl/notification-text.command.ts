import { Command } from '@nestjs/cqrs';
import { Platform } from 'src/notify-service/types/platform';

export class NotificationTextCommand extends Command<any> {
  constructor(
    public readonly phone: string,
    public readonly message: string,
    public readonly platform: Platform,
  ) {
    super();
  }
}
