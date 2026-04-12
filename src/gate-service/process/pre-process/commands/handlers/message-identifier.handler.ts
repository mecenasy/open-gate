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
import { keys } from 'src/gate-service/message-keys/keys';
import { CommandServiceClient } from 'src/proto/command';

@CommandHandler(UserMessageCommand)
export class MassageIdentifierHandler extends Handler<UserMessageCommand, Status> {
  logger: Logger;
  messageGrpc: MessagesServiceClient;
  commandGrpc: CommandServiceClient;

  constructor() {
    super();
    this.logger = new Logger(MassageIdentifierHandler.name);
  }

  onModuleInit() {
    super.onModuleInit();
    this.messageGrpc = this.grpcClient.getService<MessagesServiceClient>(MESSAGES_SERVICE_NAME);
  }
  async execute({ message, context }: UserMessageCommand): Promise<Status> {
    const text = message.content;
    const hasText = (text?.trim().length || 0) > 0;

    const attachment = message.media;
    const hasAttachments = !!attachment;

    if (!(hasText || hasAttachments)) {
      this.event.emit(new NotificationEvent(message.chatId, await this.getMessage(), message.platform));
      return {
        status: false,
        message: 'No text or attachment',
      };
    }

    if (hasText) {
      if (text?.trim().startsWith('/')) {
        this.event.emit(new IdentifyMessageEvent(message, { ...context, messageType: MessageType.Command }));
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
      path: keys.messageWrongKey,
    });

    if (message) {
      return message;
    }

    const response = await lastValueFrom(this.messageGrpc.getMessage({ key: keys.messageWrongKey }));

    if (!response?.status || !response?.data) {
      return '';
    }

    await this.cache.saveInCache<string>({
      identifier: 'message',
      path: keys.messageWrongKey,
      data: response.data.value,
      EX: 24 * 60 * 60,
    });

    return response.data.value;
  }
}
