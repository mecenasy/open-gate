import { Controller } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';

import {
  NotifyAck,
  SendVerificationCodeRequest,
  SendTokenRequest,
  OutgoingNotifyServiceController,
  OutgoingNotifyServiceControllerMethods,
  OutgoingNotifyRequest,
} from 'src/proto/notify';
import { OutgoingNotifyEvent } from './event/outgoing-notify-event';
import { PlatformTransformer } from 'src/utils/platform';
import { TypeTransformer } from 'src/utils/message-type';
import { SendVerificationCodeCommand } from './commands/impl/send-verification-code.command';
import { SendTokenCommand } from './commands/impl/send-token.command';

@Controller()
@OutgoingNotifyServiceControllerMethods()
export class OutgoingNotifyController implements OutgoingNotifyServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  async sendVerificationCode({ platforms, code, phoneNumber, email }: SendVerificationCodeRequest): Promise<NotifyAck> {
    await this.commandBus.execute(
      new SendVerificationCodeCommand(
        platforms.map((p) => PlatformTransformer.fromGrpc(p)),
        code,
        phoneNumber,
        email,
      ),
    );
    return { success: true, message: 'Verification code sent' };
  }

  async sendToken({ platforms, email, url }: SendTokenRequest): Promise<NotifyAck> {
    await this.commandBus.execute(
      new SendTokenCommand(
        platforms.map((p) => PlatformTransformer.fromGrpc(p)),
        email,
        url,
      ),
    );
    return { success: true, message: 'Token sent' };
  }

  async sendMessage({ message, platforms }: OutgoingNotifyRequest): Promise<NotifyAck> {
    if (!message) {
      return { success: false, message: 'Message is empty' };
    }

    await this.eventBus.publish(
      new OutgoingNotifyEvent(
        {
          ...message,
          media: message.media
            ? { ...message.media, data: message.media.data ? Buffer.from(message.media.data) : undefined }
            : undefined,
          platform: PlatformTransformer.fromGrpc(message.platform),
          type: TypeTransformer.fromGrpc(message.type),
        },
        platforms.map((p) => PlatformTransformer.fromGrpc(p)),
      ),
    );
    return { success: true, message: 'Message sent' };
  }
}
