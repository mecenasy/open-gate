import { Status } from 'src/gate-service/status/status';
import { MessageToQueueCommand } from '../impl/message-to-queue.command';
import { ToQueueBase } from './to-queue-base';
import { Injectable } from '@nestjs/common';
import { MessageType } from '../../types';
import { QueueService } from '@app/redis';

@Injectable()
export class AudioToQueueStrategy extends ToQueueBase {
  messageType: MessageType = MessageType.Audio;
  constructor(protected readonly queueService: QueueService) {
    super();
  }

  async execute({ message, context }: MessageToQueueCommand): Promise<Status> {
    await this.queueService.attachmentToQueue({ data: message, context });

    return {
      status: true,
      message: 'User send attachment',
    };
  }
}
