import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { QueueService, QueueType } from '@app/redis';
import { QueueMessageData } from 'src/gate-service/common/types/queue-message-data';
import { NotifyGrpcKey } from '@app/notify-grpc';
import { OUTGOING_SIGNAL_SERVICE_NAME, OutgoingSignalServiceClient } from 'src/proto/signal';

@Processor(QueueType.Attachment)
export class AttachmentsProcessor implements OnModuleInit {
  logger: Logger;
  private notifyClient!: OutgoingSignalServiceClient;

  @Inject(NotifyGrpcKey)
  public readonly notifyGrpcClient!: ClientGrpc;

  constructor(private readonly queueService: QueueService) {
    this.logger = new Logger(this.constructor.name);
  }

  onModuleInit() {
    this.notifyClient = this.notifyGrpcClient.getService<OutgoingSignalServiceClient>(OUTGOING_SIGNAL_SERVICE_NAME);
    this.logger.log('AttachmentsProcessor initialized');
  }

  @Process(QueueType.Attachment)
  async attachment(job: Job<QueueMessageData>) {
    this.logger.debug('Analyzing attachment');
    const {
      data: { media },
      context,
    } = job.data;
    const attachmentId = media?.url;

    if (!attachmentId) {
      this.logger.warn('Attachment job received without attachment ID');
      return;
    }

    const result = await lastValueFrom(this.notifyClient.downloadAttachment({ attachmentId }));

    if (!result.success) {
      this.logger.error(`❌ Failed to download attachment: ${result.error}`);
      return;
    }

    await this.queueService.audioToTextToQueue(
      {
        data: {
          ...job.data.data,
          attachment: Buffer.from(result.data),
        },
        context,
      },
      5000,
    );
  }
}
