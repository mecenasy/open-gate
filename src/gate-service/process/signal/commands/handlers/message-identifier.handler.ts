import { Handler } from '@app/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { UserMessageCommand } from '../impl/user-message.command';
import { IdentifyMessageEvent } from '../../events/identifier-message.event';
import { MessageType } from '../../types';
import { Logger } from '@nestjs/common';
import { Status } from 'src/gate-service/status/status';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';
import { lastValueFrom } from 'rxjs';
import { MESSAGES_SERVICE_NAME, MessagesServiceClient } from 'src/proto/messages';

@CommandHandler(UserMessageCommand)
export class MassageIdentifierHandler extends Handler<UserMessageCommand, Status> {
  logger: Logger;
  messageGrpc: MessagesServiceClient;

  messageKey: string = 'wrong-message';
  constructor() {
    super();
    this.logger = new Logger(MassageIdentifierHandler.name);
  }

  onModuleInit() {
    super.onModuleInit();
    this.messageGrpc = this.grpcClient.getService<MessagesServiceClient>(MESSAGES_SERVICE_NAME);
  }
  async execute({ message, context }: UserMessageCommand): Promise<Status> {
    const { dataMessage } = message;

    const text = dataMessage?.message;
    const hasText = (text?.trim().length || 0) > 0;

    const attachment = dataMessage?.attachments?.[0];
    const hasAttachments = !!attachment;
    if (!(hasText || hasAttachments)) {
      const errorMessage = await this.getMessage();
      this.event.emit(new NotificationEvent(message.source, errorMessage));
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

  private async getMessage() {
    const message = await this.cache.getFromCache<string>({
      identifier: 'message',
      path: this.messageKey,
    });

    if (message) {
      return message;
    }

    const response = await lastValueFrom(this.messageGrpc.getMessage({ key: this.messageKey }));

    if (!response?.status || !response?.data) {
      return '';
    }

    await this.cache.saveInCache<string>({
      identifier: 'message',
      path: this.messageKey,
      data: response.data.value,
    });

    return response.data.value;
  }
}
