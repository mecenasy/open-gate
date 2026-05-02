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
import { Metadata } from '@grpc/grpc-js';

@EventsHandler(MessageEvent)
export class MessageBridgeHandler implements IEventHandler<MessageEvent>, OnModuleInit {
  private readonly logger = new Logger(MessageBridgeHandler.name);
  private gateClient!: IncomingNotifyServiceClient;

  constructor(
    @Inject(Transform) private readonly transformers: Transform[],
    @Inject(GateGrpcKey) private readonly grpcClient: ClientGrpc,
    private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    this.gateClient = this.grpcClient.getService<IncomingNotifyServiceClient>(INCOMING_NOTIFY_SERVICE_NAME);
  }

  async handle({ message: data, platform, tenantId }: MessageEvent): Promise<void> {
    const transformer = this.transformers.find((t) => t.platform === platform);
    if (!transformer) {
      throw new Error(`No transformer found for platform ${platform}`);
    }

    const message = await transformer.transform(data);

    if (message.media) {
      await this.eventBus.publish(new AttachmentEvent(message, platform, tenantId));
      return;
    }

    try {
      const metadata = new Metadata();
      if (tenantId) {
        metadata.set('x-tenant-id', tenantId);
      }

      await firstValueFrom(
        this.gateClient.receiveMessage(
          {
            data: {
              ...message,
              platform: PlatformTransformer.toGrpc(message.platform),
              type: TypeTransformer.toGrpc(message.type),
            },
            message: 'message transformed to string',
            status: true,
          },
          metadata,
        ),
      );
      this.logger.log(`✅ Message forwarded to core-service [tenant=${tenantId ?? 'unset'}, platform=${platform}]`);
    } catch (error) {
      this.logger.error(`❌ Failed to forward message to core-service`, error);
    }
  }
}
