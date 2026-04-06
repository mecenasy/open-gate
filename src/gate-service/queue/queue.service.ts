import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { QueueMessageData, QueueMessageToAudioData } from '../common/types/queue-message-data';
import { Logger } from '@nestjs/common';
import { QueueType } from './types';

@Injectable()
export class QueueService {
  logger: Logger;
  constructor(
    @InjectQueue(QueueType.Command) private readonly commandQueue: Queue,
    @InjectQueue(QueueType.Message) private readonly messageQueue: Queue,
    @InjectQueue(QueueType.Transcription) private readonly transcriptionQueue: Queue,
    @InjectQueue(QueueType.Speech) private readonly speechQueue: Queue,
    @InjectQueue(QueueType.Attachment) private readonly attachmentQueue: Queue,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async commandToQueue(data: QueueMessageData, delay?: number): Promise<void> {
    this.logger.debug('Adding command to queue');
    await this.commandQueue.add(QueueType.Command, data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async messageToQueue(data: QueueMessageData, delay?: number): Promise<void> {
    this.logger.debug('Adding message to queue');
    await this.messageQueue.add(QueueType.Message, data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async audioToTextToQueue(data: QueueMessageData, delay?: number): Promise<void> {
    this.logger.debug('Adding audio to text to queue');
    await this.transcriptionQueue.add(QueueType.Transcription, data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async textToAudioToQueue(data: QueueMessageToAudioData, delay?: number): Promise<void> {
    this.logger.debug('Adding text to audio to queue');
    await this.speechQueue.add(QueueType.Speech, data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
  async attachmentToQueue(data: QueueMessageData, delay?: number): Promise<void> {
    this.logger.debug('Adding attachment to queue');
    await this.attachmentQueue.add(QueueType.Attachment, data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
