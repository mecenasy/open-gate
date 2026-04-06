import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import { EventService } from 'src/user-service/common/event/event.service';
import { QueueService } from 'src/user-service/queue/queue.service';
import { QueueMessageData } from 'src/user-service/common/types/queue-message-data';
import { QueueType } from 'src/user-service/queue/types';

@Processor(QueueType.Attachment)
export class AttachmentsProcessor implements OnModuleInit {
  logger: Logger;
  private readonly SIGNAL_URL = 'http://signal_bridge:8080';

  constructor(
    private readonly httpService: HttpService,
    private readonly eventService: EventService,
    private readonly queueService: QueueService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  onModuleInit() {
    this.logger.log('AttachmentsProcessor initialized');
  }

  @Process(QueueType.Attachment)
  async attachment(job: Job<QueueMessageData>) {
    this.logger.debug('Analyzing attachment');
    const {
      data: { dataMessage },
      context,
    } = job.data;
    const attachmentId = dataMessage?.attachments?.[0]?.id;

    try {
      const { data } = await lastValueFrom(
        this.httpService.get<Buffer>(`${this.SIGNAL_URL}/v1/attachments/${attachmentId}`, {
          responseType: 'arraybuffer',
          timeout: 5000,
        }),
      );

      await this.queueService.audioToTextToQueue(
        {
          data: {
            ...job.data.data,
            attachment: data,
          },
          context,
        },
        5000,
      );
    } catch (error) {
      // TODO: wysłać informację, by użytkownik wybrał metodę command
      if (isAxiosError(error)) {
        this.logger.warn('Przekroczono limit zapytań (Rate Limit).');
      } else {
        this.logger.error('Nieoczekiwany błąd:', error);
      }
    }
  }
}
