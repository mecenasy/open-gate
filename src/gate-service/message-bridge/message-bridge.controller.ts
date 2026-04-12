import { Controller, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  IncomingNotifyServiceControllerMethods,
  IncomingNotifyServiceController,
  IncomingNotifyRequest,
  NotifyAck,
} from 'src/proto/notify';
import { PlatformTransformer } from 'src/utils/platform';
import { TypeTransformer } from 'src/utils/message-type';
import { UnifiedMessageEvent } from 'src/gate-service/process/pre-process/commands/impl/unified-message.command';

@Controller()
@IncomingNotifyServiceControllerMethods()
export class MessageBridgeController implements IncomingNotifyServiceController {
  private readonly logger = new Logger(MessageBridgeController.name);

  constructor(private readonly eventBus: EventBus) {}

  receiveMessage({ data, message, status }: IncomingNotifyRequest): NotifyAck {
    try {
      if (!status || !data) {
        throw new Error(message);
      }

      this.eventBus.publish(
        new UnifiedMessageEvent({
          ...data,
          platform: PlatformTransformer.fromGrpc(data.platform),
          type: TypeTransformer.fromGrpc(data.type),
          media: data?.media
            ? {
                url: data.media.url,
                contentType: data.media.contentType,
                data: data.media.data ? Buffer.from(data.media.data) : undefined,
                duration: data.media.duration,
              }
            : undefined,
        }),
      );

      this.logger.log(`✅ Signal message received from notify-service`);
      return { success: true, message: 'Message received' };
    } catch (error) {
      this.logger.error(`❌ Failed to process incoming message`, error);
      return { success: false, message: String(error) };
    }
  }
}
