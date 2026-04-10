import { Handler } from '@app/handler';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { CommandHandler } from '@nestjs/cqrs';
import { UserMessageCommand } from '../impl/user-message.command';
import { IdentifyMessageEvent } from '../../events/identifier-message.event';
import { MessageType } from '../../types';
import { Logger } from '@nestjs/common';
import { Status } from 'src/gate-service/status/status';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';

@CommandHandler(UserMessageCommand)
export class MassageIdentifierHandler extends Handler<UserMessageCommand, Status, UserProxyServiceClient> {
  logger: Logger;
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
    this.logger = new Logger(MassageIdentifierHandler.name);
  }

  async execute({ message, context }: UserMessageCommand): Promise<Status> {
    const { dataMessage } = message;

    const text = dataMessage?.message;
    const hasText = (text?.trim().length || 0) > 0;

    const attachment = dataMessage?.attachments?.[0];
    const hasAttachments = !!attachment;
    if (!(hasText || hasAttachments)) {
      //TODO: Pobra z bazy cache tekst wiadomości
      this.event.emit(new NotificationEvent(message.source, 'Przepraszam, ale nie wiem co masz na myśli'));
      return {
        status: false,
        message: 'No text or attachment',
      };
    }

    if (hasText) {
      if (text?.trim().startsWith('/')) {
        this.event.emit(new IdentifyMessageEvent(message, { ...context, messageType: MessageType.Command }));
        // TODO: Pobrać listę komend z bazy danych i sprawdzić czy tekst zaczyna się od jednej z komend i ma parametry np nr bramy
        return {
          status: true,
          message: 'User send command',
        };
      }

      this.event.emit(new IdentifyMessageEvent(message, { ...context, messageType: MessageType.Message }));
      return {
        status: true,
        message: 'User send text command',
      };
    }

    this.event.emit(new IdentifyMessageEvent(message, { ...context, messageType: MessageType.Audio }));
    return {
      status: true,
      message: 'User send attachment',
    };
  }
}
