import { Controller } from '@nestjs/common';

import { SmsService } from '../sms/sms.service';
import { SmtpService } from '../smtp/smtp.service';
import {
  NotifyAck,
  SendSmsRequest,
  SendMailCodeRequest,
  SendResetTokenRequest,
  OutgoingNotifyServiceController,
  OutgoingNotifyServiceControllerMethods,
  OutgoingNotifyRequest,
} from 'src/proto/notify';
import { EventBus } from '@nestjs/cqrs';
import { OutgoingNotifyEvent } from './event/outgoing-notify-event';
import { PlatformTransformer } from 'src/utils/platform';
import { TypeTransformer } from 'src/utils/message-type';

@Controller()
@OutgoingNotifyServiceControllerMethods()
export class OutgoingNotifyController implements OutgoingNotifyServiceController {
  constructor(
    private readonly eventBus: EventBus,
    private readonly smsService: SmsService,
    private readonly smtpService: SmtpService,
  ) {}

  async sendSmsCode({ phoneNumber, code }: SendSmsRequest): Promise<NotifyAck> {
    await this.smsService.sendCode(phoneNumber, code);
    return { success: true, message: 'SMS sent' };
  }

  async sendMailCode({ email, code }: SendMailCodeRequest): Promise<NotifyAck> {
    await this.smtpService.sendVerificationCode(email, code);
    return { success: true, message: 'Mail sent' };
  }

  async sendResetToken({ email, url }: SendResetTokenRequest): Promise<NotifyAck> {
    await this.smtpService.sendResetToken(email, url);
    return { success: true, message: 'Reset token sent' };
  }

  async sendMessage({ message, platforms }: OutgoingNotifyRequest): Promise<NotifyAck> {
    if (!message) {
      return { success: false, message: 'Message is empty' };
    }

    await this.eventBus.publish(
      new OutgoingNotifyEvent(
        {
          ...message,
          media: undefined,
          platform: PlatformTransformer.fromGrpc(message.platform),
          type: TypeTransformer.fromGrpc(message.type),
        },
        platforms.map((p) => PlatformTransformer.fromGrpc(p)),
      ),
    );
    return { success: true, message: 'Message sent' };
  }
}
