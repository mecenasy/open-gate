import { Module } from '@nestjs/common';
import { commandsHandlers } from './commands/handlers';
import { EventService } from '@app/event';
import { NotificationBase } from './commands/strategy/notification-base';
import { NotificationTextStrategy } from './commands/strategy/notification-text.strategy';
import { NotificationAudioStrategy } from './commands/strategy/notification-audio.strategy';
import { NotificationEventHandler } from './events/handlers/notification-event.handler';

@Module({
  providers: [
    EventService,
    NotificationTextStrategy,
    NotificationAudioStrategy,
    {
      provide: NotificationBase,
      useFactory: (textStrategy: NotificationTextStrategy, audioStrategy: NotificationAudioStrategy) => [
        textStrategy,
        audioStrategy,
      ],
      inject: [NotificationTextStrategy, NotificationAudioStrategy],
    },
    NotificationEventHandler,
    ...commandsHandlers,
  ],
})
export class NotificationModule {}
