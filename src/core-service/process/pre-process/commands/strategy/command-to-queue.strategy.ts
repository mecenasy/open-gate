import { Status } from 'src/core-service/status/status';
import { MessageToQueueCommand } from '../impl/message-to-queue.command';
import { ToQueueBase } from './to-queue-base';
import { Injectable } from '@nestjs/common';
import { MessageType } from '../../types';
import { QueueService } from '@app/redis';

@Injectable()
export class CommandToQueueStrategy extends ToQueueBase {
  messageType: MessageType = MessageType.Command;
  constructor(protected readonly queueService: QueueService) {
    super();
  }

  async execute({ message, context }: MessageToQueueCommand): Promise<Status> {
    await this.queueService.commandToQueue({ data: message, context });

    return {
      status: true,
      message: 'User send attachment',
    };
  }
}
