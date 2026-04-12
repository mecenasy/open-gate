import { Handler } from '@app/handler';
import { SofCommand } from '../impl/sof-command';
import { Status } from 'src/gate-service/status/status';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';
import { QueueService } from '@app/redis';
import { Inject } from '@nestjs/common';
import { UserContext } from 'src/gate-service/context/user-context';
import { MessageType } from 'src/gate-service/process/pre-process/types';
import { Platform } from 'src/notify-service/types/platform';

export abstract class BaseCommandHandler extends Handler<SofCommand<number>, Status> {
  @Inject()
  private readonly queueService: QueueService;

  constructor() {
    super();
  }

  async processing(message: string, context: UserContext, platform: Platform): Promise<Status> {
    switch (context.messageType) {
      case MessageType.Message: {
        this.event.emit(new NotificationEvent({ phone: context.phone, message, platform }));
        break;
      }
      case MessageType.Audio: {
        await this.queueService.textToAudioToQueue({
          message,
          context,
          platform,
        });
        break;
      }
      case MessageType.Command: {
        this.event.emit(new NotificationEvent({ phone: context.phone, message, platform }));
        break;
      }
    }

    return { status: true, message: 'Command executed' };
  }
}
