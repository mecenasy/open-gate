import { Injectable, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { EventBus, ofType } from '@nestjs/cqrs';
import { NotificationEvent } from '../notification.event';
import { NotificationBase } from '../../commands/strategy/notification-base';

@Injectable()
export class NotificationEventHandler implements OnApplicationBootstrap {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(NotificationBase) private readonly strategies: NotificationBase[],
  ) {}

  onApplicationBootstrap() {
    this.eventBus.pipe(ofType(NotificationEvent)).subscribe({
      next: (event: NotificationEvent) => {
        const strategy = this.strategies.find((s) => s.notificationType === event.type);
        void strategy?.execute(event.data);
      },
      error: (err) => console.error('NotificationEventHandler error:', err),
    });
  }
}
