import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Type } from 'src/notify-service/types/unified-message';
import { NotificationBase } from './notification-base';
import { NotificationEventData } from '../../events/notification.event';
import { NotificationTextCommand } from '../impl/notification-text.command';

@Injectable()
export class NotificationTextStrategy extends NotificationBase {
  notificationType: Type = Type.Text;

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async execute({ phone, message, platform }: NotificationEventData): Promise<any> {
    return this.commandBus.execute(new NotificationTextCommand(phone, message as string, platform));
  }
}
