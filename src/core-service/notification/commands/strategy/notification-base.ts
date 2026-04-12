import { Type } from 'src/notify-service/types/unified-message';
import { NotificationEventData } from '../../events/notification.event';
import { Status } from 'src/core-service/status/status';

export abstract class NotificationBase {
  abstract notificationType: Type;

  abstract execute(data: NotificationEventData): Promise<Status>;
}
