import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Getaway } from 'src/bff-service/common/getaway/getaway.getaway';
import { VerificationCodeReceivedEvent } from './verification-code-received.event';

export const VERIFICATION_ROOM_PREFIX = 'verify:';
export const VERIFICATION_CODE_EVENT = 'verification-code';

@EventsHandler(VerificationCodeReceivedEvent)
export class VerificationCodeReceivedHandler implements IEventHandler<VerificationCodeReceivedEvent> {
  private readonly logger = new Logger(VerificationCodeReceivedHandler.name);

  constructor(private readonly gateway: Getaway) {}

  handle({ phoneE164, code, source }: VerificationCodeReceivedEvent): void {
    const room = `${VERIFICATION_ROOM_PREFIX}${phoneE164}`;
    this.gateway.server.to(room).emit(VERIFICATION_CODE_EVENT, { code, source });
    this.logger.log(`Emitted ${source} code to room ${room}.`);
  }
}
