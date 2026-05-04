import { Controller, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  type BffAck,
  BffContactBindingBridgeController as IBffContactBindingBridge,
  BffContactBindingBridgeControllerMethods,
  type ForwardBindingVerifiedRequest,
} from 'src/proto/bff';
import { ContactBindingVerifiedEvent } from './events/contact-binding-verified.event';

@Controller()
@BffContactBindingBridgeControllerMethods()
export class ContactBindingBridgeController implements IBffContactBindingBridge {
  private readonly logger = new Logger(ContactBindingBridgeController.name);

  constructor(private readonly eventBus: EventBus) {}

  forwardBindingVerified(req: ForwardBindingVerifiedRequest): BffAck {
    this.eventBus.publish(
      new ContactBindingVerifiedEvent(
        req.bindingId,
        req.tenantId,
        req.userId,
        req.platform,
        req.platformUserId,
        req.phoneE164,
      ),
    );
    this.logger.log(`Received binding-verified push for ${req.bindingId} from notify-service.`);
    return { ok: true };
  }
}
