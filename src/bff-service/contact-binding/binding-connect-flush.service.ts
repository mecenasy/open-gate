import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GatewayClientConnectedEvent } from 'src/bff-service/common/getaway/gateway-client-connected.event';
import { ContactBindingClientService } from './contact-binding.client.service';
import { BINDING_ROOM_PREFIX, BINDING_VERIFIED_EVENT } from './events/contact-binding-verified.handler';

/**
 * Race-condition mop-up: if the front opens its socket and joins
 * `binding:<id>` *after* the verification has already landed, the
 * one-shot emit is gone. On every fresh connection we ask db-service
 * for the binding state and, if it's already verified, replay the
 * event just to that socket.
 */
@Injectable()
@EventsHandler(GatewayClientConnectedEvent)
export class BindingConnectFlushService implements IEventHandler<GatewayClientConnectedEvent> {
  private readonly logger = new Logger(BindingConnectFlushService.name);

  constructor(private readonly client: ContactBindingClientService) {}

  async handle({ client, room }: GatewayClientConnectedEvent): Promise<void> {
    if (!room.startsWith(BINDING_ROOM_PREFIX)) return;
    const bindingId = room.slice(BINDING_ROOM_PREFIX.length);
    if (!bindingId) return;

    try {
      const binding = await this.client.getBinding(bindingId);
      if (binding && binding.status === 'verified') {
        client.emit(BINDING_VERIFIED_EVENT, {
          bindingId: binding.id,
          userId: binding.userId,
          platform: binding.platform,
          platformUserId: '',
          phoneE164: binding.phoneE164,
        });
        this.logger.log(`Flushed already-verified binding ${bindingId} to fresh socket.`);
      }
    } catch (err) {
      this.logger.error(`Failed to flush binding ${bindingId}: ${(err as Error).message}`);
    }
  }
}
