import { Module } from '@nestjs/common';
import { NotificationSaga } from './notification.saga';
import { commandsHandlers } from './commands/handlers';
import { EventService } from '@app/event';

@Module({
  providers: [NotificationSaga, EventService, ...commandsHandlers],
})
export class NotificationModule {}
