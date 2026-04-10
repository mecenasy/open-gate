import { Inject, Injectable } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';

@Injectable()
export class EventService {
  @Inject(EventBus)
  private readonly publisher!: EventBus;

  public emit<T extends IEvent, R>(event: T, context?: R) {
    this.publisher.publish(event, context);
  }
}
