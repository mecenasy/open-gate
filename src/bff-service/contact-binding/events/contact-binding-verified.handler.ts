import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Getaway } from 'src/bff-service/common/getaway/getaway.getaway';
import { ContactBindingVerifiedEvent } from './contact-binding-verified.event';

export const BINDING_ROOM_PREFIX = 'binding:';
export const BINDING_VERIFIED_EVENT = 'binding-verified';

@EventsHandler(ContactBindingVerifiedEvent)
export class ContactBindingVerifiedHandler implements IEventHandler<ContactBindingVerifiedEvent> {
  private readonly logger = new Logger(ContactBindingVerifiedHandler.name);

  constructor(private readonly gateway: Getaway) {}

  handle(event: ContactBindingVerifiedEvent): void {
    const room = `${BINDING_ROOM_PREFIX}${event.bindingId}`;
    this.gateway.server.to(room).emit(BINDING_VERIFIED_EVENT, {
      bindingId: event.bindingId,
      userId: event.userId,
      platform: event.platform,
      platformUserId: event.platformUserId,
      phoneE164: event.phoneE164,
    });
    this.logger.log(`Emitted binding-verified to room ${room}.`);
  }
}
