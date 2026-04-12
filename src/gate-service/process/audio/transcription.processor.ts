/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { QueueMessageData } from '../../common/types/queue-message-data';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import { QueueType } from '@app/redis';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';
import { ProcessorBase } from '../processor-base';
import { keys } from '../../message-keys/keys';
interface SerializedBuffer {
  type: 'Buffer';
  data: number[];
}

@Processor(QueueType.Transcription)
export class TranscriptionProcessor extends ProcessorBase {
  constructor() {
    super();
  }

  @Process(QueueType.Transcription)
  async analyzeAudio(job: Job<QueueMessageData>) {
    this.logger.debug('Analyzing Audio message');
    if (!job.data.data) {
      this.logger.warn('No data found in job data');
      return;
    }

    const { data, context } = job.data;

    if (!data.media) {
      this.eventService.emit(
        new NotificationEvent(
          context.phone,

          await this.getMessage(keys.missingAttachmentKey),
          data.platform,
        ),
      );
      this.logger.warn('No attachment found in job data');
      return;
    }

    try {
      const fileMp3 = await this.convertToMp3(data.media.data);

      const message = await this.groqService.createTranscription(fileMp3);

      data.content = message;
      await this.queueService.messageToQueue({
        data,
        context,
      });
    } catch (error) {
      this.eventService.emit(
        new NotificationEvent(context.phone, await this.getMessage(keys.transcriptionAttachmentKey), data.platform),
      );
      this.logger.error('Error processing audio:', error);
    }
  }
  private validateAttachment(attachment: any): Buffer {
    let buffer: Buffer;

    if (Buffer.isBuffer(attachment)) {
      buffer = attachment;
    } else if (
      attachment &&
      typeof attachment === 'object' &&
      'type' in attachment &&
      attachment.type === 'Buffer' &&
      'data' in attachment &&
      Array.isArray(attachment.data)
    ) {
      const serializedBuffer = attachment as SerializedBuffer;
      buffer = Buffer.from(serializedBuffer.data);
    } else if (attachment && 'data' in attachment) {
      // Try to extract buffer data from serialized object
      const data: unknown = attachment.data;
      if (Array.isArray(data)) {
        buffer = Buffer.from(data as number[]);
      } else {
        throw new Error('Attachment data is not in a valid format');
      }
    } else {
      throw new Error('Input is not a Buffer or cannot be converted to Buffer');
    }

    return buffer;
  }

  private async convertToMp3(attachment: any): Promise<Buffer> {
    const buffer = this.validateAttachment(attachment);

    return new Promise((resolve, reject) => {
      const inputStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });

      const chunks: Buffer[] = [];

      ffmpeg(inputStream)
        .toFormat('mp3')
        .on('error', (error) => {
          this.logger.error('FFmpeg error:', error);
          reject(error);
        })
        .on('end', () => {
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk) => chunks.push(chunk))
        .on('error', reject);
    });
  }
}
