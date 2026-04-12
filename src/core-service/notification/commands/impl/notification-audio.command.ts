import { Command } from '@nestjs/cqrs';
import { Platform } from 'src/notify-service/types/platform';

export class NotificationAudioCommand extends Command<any> {
  constructor(
    public readonly phone: string,
    public readonly audioFile: Buffer,
    public readonly platform: Platform,
  ) {
    super();
  }
}
