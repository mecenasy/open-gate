import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommand } from '@nestjs/cqrs';
import { MessageCommand } from '../impl/message.command';
import { Transform } from '../platforms/transformer';
import { Status } from 'src/gate-service/status/status';
import { UnifiedMessageEvent } from '../event/unified-message.event';

@CommandHandler(MessageCommand)
export class MessageBridgeHandler implements ICommand {
  private readonly logger = new Logger(MessageBridgeHandler.name);

  constructor(
    private readonly eventBus: EventBus,
    @Inject(Transform) private readonly transformers: Transform[],
  ) {}

  async execute({ message: data, platform }: MessageCommand): Promise<Status> {
    const transformer = this.transformers.find((t) => t.platform === platform);
    if (!transformer) {
      throw new Error(`No transformer found for platform ${platform}`);
    }

    const message = await transformer.transform(data);

    try {
      this.eventBus.publish(new UnifiedMessageEvent(message));
      this.logger.log(`✅ message received from notify-service platform`);
      return { status: true, message: 'Message received' };
    } catch (error) {
      this.logger.error(`❌ Failed to process incoming Signal message ${platform}`, error);
      return { status: false, message: String(error) };
    }
  }
}
