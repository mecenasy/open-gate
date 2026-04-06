import { Controller } from '@nestjs/common';
import {
  NotificationAck,
  NotificationServiceController,
  NotificationServiceControllerMethods,
  SendMailCodeRequest,
  SendResetTokenRequest,
  SendSmsRequest,
} from 'src/proto/notification';
import { SmsService } from '../sms/sms.service';
import { SmtpService } from '../smtp/smtp.service';

@Controller()
@NotificationServiceControllerMethods()
export class NotificationController implements NotificationServiceController {
  constructor(
    private readonly smsService: SmsService,
    private readonly smtpService: SmtpService,
  ) {}

  async sendSms({ phoneNumber, code }: SendSmsRequest): Promise<NotificationAck> {
    await this.smsService.sendCode(phoneNumber, code);
    return { success: true, message: 'SMS sent' };
  }

  async sendMailCode({ email, code }: SendMailCodeRequest): Promise<NotificationAck> {
    await this.smtpService.sendVerificationCode(email, code);
    return { success: true, message: 'Mail sent' };
  }

  async sendResetToken({ email, url }: SendResetTokenRequest): Promise<NotificationAck> {
    await this.smtpService.sendResetToken(email, url);
    return { success: true, message: 'Reset token sent' };
  }
}
