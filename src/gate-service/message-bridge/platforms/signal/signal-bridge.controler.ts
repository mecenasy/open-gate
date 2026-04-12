import { Controller, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  IncomingSignalRequest,
  IncomingSignalServiceController,
  IncomingSignalServiceControllerMethods,
  SignalAck,
} from 'src/proto/signal';
import { MessageEvent } from '../../event/message.event';
import { SignalMessage } from '../../../process/pre-process/types';
import { Platform } from 'src/gate-service/message-bridge/platform';

@Controller()
@IncomingSignalServiceControllerMethods()
export class SignalBridgeService implements IncomingSignalServiceController {
  private readonly logger = new Logger(SignalBridgeService.name);

  constructor(private readonly eventBus: EventBus) {}

  receiveMessage(request: IncomingSignalRequest): SignalAck {
    try {
      const message = JSON.parse(request.payload) as SignalMessage;
      this.eventBus.publish(new MessageEvent(message, Platform.Signal));

      this.logger.log(`✅ Signal message received from notify-service`);
      return { success: true, message: 'Message received' };
    } catch (error) {
      this.logger.error(`❌ Failed to process incoming Signal message`, error);
      return { success: false, message: String(error) };
    }
  }
}
