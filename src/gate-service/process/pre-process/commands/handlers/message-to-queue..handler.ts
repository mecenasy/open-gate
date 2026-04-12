import { Handler } from '@app/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserMessageCommand } from '../impl/user-message.command';
import { MessageToQueueCommand } from '../impl/message-to-queue.command';
import { Status } from 'src/gate-service/status/status';
import { ToQueueBase } from '../strategy/to-queue-base';

@CommandHandler(MessageToQueueCommand)
export class MessageToQueueHandler extends Handler<UserMessageCommand, Status> {
  constructor(@Inject(ToQueueBase) private readonly toQueues: ToQueueBase[]) {
    super();
  }

  async execute(data: MessageToQueueCommand): Promise<Status> {
    const toQueue = this.toQueues.find((toQueue) => {
      return toQueue.messageType === data.context.messageType;
    });

    await toQueue?.execute(data);
    return {
      status: true,
      message: 'User send attachment',
    };
  }
}
