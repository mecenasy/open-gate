import { Handler } from 'src/gate-service/common/handler/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { UserMessageCommand } from '../impl/user-message.command';
import { MessageToQueueCommand } from '../impl/message-to-queue.command';
import { QueueService } from '@app/redis';
import { MessageType } from '../../types';
import { Status } from 'src/gate-service/status/status';

@CommandHandler(MessageToQueueCommand)
export class MessageToQueueHandler extends Handler<UserMessageCommand, Status> {
  constructor(private readonly queueService: QueueService) {
    super();
  }

  async execute({ message, context }: MessageToQueueCommand): Promise<Status> {
    switch (context.messageType) {
      case MessageType.Message: {
        await this.queueService.messageToQueue({ data: message, context });
        break;
      }
      case MessageType.Audio: {
        await this.queueService.attachmentToQueue({ data: message, context });
        break;
      }
      default:
        await this.queueService.commandToQueue({ data: message, context });
        break;
    }

    return {
      status: true,
      message: 'User send attachment',
    };
  }
}
