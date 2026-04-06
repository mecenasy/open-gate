import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';

@Injectable()
export class EventService {
  logger: Logger;

  constructor(private readonly eventBuss: EventBus) {
    this.logger = new Logger(this.constructor.name);
  }

  public emit<T extends IEvent, R>(event: T, context?: R) {
    this.logger.log(`Emitting event: ${event.constructor.name}`);
    this.eventBuss.publish(event, context);
  }
}
