import { Controller, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  BffAck,
  BffNotifyBridgeController as IBffNotifyBridge,
  BffNotifyBridgeControllerMethods,
  ForwardVerificationCodeRequest,
} from 'src/proto/bff';
import { VerificationCodeReceivedEvent } from './events/verification-code-received.event';

@Controller()
@BffNotifyBridgeControllerMethods()
export class VerificationBridgeController implements IBffNotifyBridge {
  private readonly logger = new Logger(VerificationBridgeController.name);

  constructor(private readonly eventBus: EventBus) {}

  forwardVerificationCode({ phoneE164, code, source }: ForwardVerificationCodeRequest): BffAck {
    this.eventBus.publish(new VerificationCodeReceivedEvent(phoneE164, code, source));
    this.logger.log(`Received ${source} code for ${phoneE164} from notify-service.`);
    return { ok: true };
  }
}
