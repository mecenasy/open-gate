import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Type } from 'src/notify-service/types/unified-message';
import { NotificationBase } from './notification-base';
import { NotificationEventData } from '../../events/notification.event';
import { NotificationAudioCommand } from '../impl/notification-audio.command';

@Injectable()
export class NotificationAudioStrategy extends NotificationBase {
  notificationType: Type = Type.Audio;

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async execute({ phone, message, platform }: NotificationEventData): Promise<any> {
    return this.commandBus.execute(new NotificationAudioCommand(phone, Buffer.from(message as Buffer), platform));
  }
}
