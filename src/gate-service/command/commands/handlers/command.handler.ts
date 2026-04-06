import { Handler } from 'src/user-service/common/handler/handler';
import { SofCommand } from '../impl/sof-command';
import { Status } from 'src/user-service/status/status';
import { NotificationEvent } from 'src/user-service/notification/events/notification.event';
import { QueueService } from 'src/user-service/queue/queue.service';
import { Inject } from '@nestjs/common';
import { UserContext } from 'src/user-service/context/user-context';
import { MessageType } from 'src/user-service/process/signal/types';

export abstract class SofCommandHandler extends Handler<SofCommand<number>, Status> {
  @Inject()
  private readonly queueService: QueueService;

  constructor() {
    super();
  }

  async processing(message: string, context: UserContext) {
    switch (context.messageType) {
      case MessageType.Message: {
        this.event.emit(new NotificationEvent(context.phone, message));
        break;
      }
      case MessageType.Audio: {
        await this.queueService.textToAudioToQueue({
          message,
          context,
        });
        break;
      }
      case MessageType.Command: {
        this.event.emit(new NotificationEvent(context.phone, message));
        break;
      }
      default: {
        this.event.emit(
          new NotificationEvent(
            context.phone,
            'Przepraszam ale nie rozumiem. mój mózg szwankuje. wypróbuj inaczej wydać polecenie',
          ),
        );
        break;
      }
    }

    return { status: true, message: 'Command executed' };
  }
}
