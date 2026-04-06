import { Module } from '@nestjs/common';
import { NotificationSaga } from './notification.saga';
import { commandsHandlers } from './commands/handlers';

@Module({
  providers: [NotificationSaga, ...commandsHandlers],
})
export class NotificationModule {}
