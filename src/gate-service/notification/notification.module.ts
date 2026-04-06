import { Module } from '@nestjs/common';
import { NotificationSaga } from './notification.saga';

import { commandsHandlers } from './commands/handlers';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [NotificationSaga, ...commandsHandlers],
})
export class NotificationModule {}
