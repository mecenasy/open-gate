import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Transform } from '../platforms/transformer';
import { firstValueFrom } from 'rxjs';
import { INCOMING_NOTIFY_SERVICE_NAME, IncomingNotifyServiceClient } from 'src/proto/notify';
import type { ClientGrpc } from '@nestjs/microservices';
import { GateGrpcKey } from '@app/gate-grpc';
import { PlatformTransformer } from 'src/utils/platform';
import { TypeTransformer } from 'src/utils/message-type';
import { MessageEvent } from '../event/message.event';
import { AttachmentEvent } from '../event/attachment-event';
import { Attachment } from '../platforms/attachment';

@EventsHandler(AttachmentEvent)
export class AttachmentBridgeHandler implements IEventHandler<AttachmentEvent>, OnModuleInit {
  private readonly logger = new Logger(AttachmentBridgeHandler.name);
  private gateClient!: IncomingNotifyServiceClient;

  constructor(
    @Inject(Transform) private readonly attachments: Attachment[],
    @Inject(GateGrpcKey) private readonly grpcClient: ClientGrpc,
    private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    this.gateClient = this.grpcClient.getService<IncomingNotifyServiceClient>(INCOMING_NOTIFY_SERVICE_NAME);
  }

  async handle({ message, platform }: AttachmentEvent): Promise<void> {
    const attachments = this.attachments.find((t) => t.platform === platform);
    if (!attachments) {
      throw new Error(`No transformer found for platform ${platform}`);
    }

    const data = await attachments.download(message);

    if (!data || !message.media?.url) {
      throw new Error('No data found');
    }

    try {
      await firstValueFrom(
        this.gateClient.receiveMessage({
          data: {
            ...message,
            media: { ...message.media, data },
            platform: PlatformTransformer.toGrpc(message.platform),
            type: TypeTransformer.toGrpc(message.type),
          },
          message: 'message transformed to string ',
          status: true,
        }),
      );
      this.logger.log(`✅ Signal message forwarded to gate-service`);
    } catch (error) {
      this.logger.error(`❌ Failed to forward Signal message to gate-service`, error);
    }
  }
}
