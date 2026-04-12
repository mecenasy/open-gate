import { Injectable, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { EventBus, ofType } from '@nestjs/cqrs';
import { NotificationEvent } from '../notification.event';
import { NotificationBase } from '../../commands/strategy/notification-base';
import { CustomLogger } from '@app/logger';

@Injectable()
export class NotificationEventHandler implements OnApplicationBootstrap {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(NotificationBase) private readonly strategies: NotificationBase[],
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(NotificationEventHandler.name);
  }

  onApplicationBootstrap() {
    this.eventBus.pipe(ofType(NotificationEvent)).subscribe({
      next: (event: NotificationEvent) => {
        const strategy = this.strategies.find((s) => s.notificationType === event.type);
        void strategy?.execute(event.data);
      },
      error: (err) => this.logger.error('Failed to handle notification event', err),
    });
  }
}
