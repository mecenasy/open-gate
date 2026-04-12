import { MessageToQueueCommand } from '../impl/message-to-queue.command';
import { Status } from 'src/gate-service/status/status';
import { MessageType } from '../../types';

export abstract class ToQueueBase {
  abstract messageType: MessageType;

  abstract execute(data: MessageToQueueCommand): Promise<Status>;
}
