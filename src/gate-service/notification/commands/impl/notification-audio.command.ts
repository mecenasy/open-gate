import { Command } from '@nestjs/cqrs';

export class NotificationAudioCommand extends Command<any> {
  constructor(
    public readonly phone: string,
    public readonly audioFile: Buffer,
  ) {
    super();
  }
}
