import { Command } from '@nestjs/cqrs';

export class NotificationTextCommand extends Command<any> {
  constructor(
    public readonly phone: string,
    public readonly message: string,
  ) {
    super();
  }
}
