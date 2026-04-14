import { Injectable, Logger } from '@nestjs/common';
import { Platform } from 'src/notify-service/types/platform';
import { VerificationCodePlatform } from '../base/verification-code-platform';
import { DynamicSmtpService } from './dynamic-smtp.service';

@Injectable()
export class MailVerificationCodePlatform extends VerificationCodePlatform {
  platform = Platform.Email;
  private readonly logger = new Logger(MailVerificationCodePlatform.name);

  constructor(private readonly smtp: DynamicSmtpService) {
    super();
  }

  async send({ email }: { phoneNumber?: string; email?: string }, code: number): Promise<void> {
    if (!email) {
      this.logger.warn('Mail platform: email is missing, skipping.');
      return;
    }

    try {
      await this.smtp.sendMail({
        to: email,
        subject: 'Your verification code',
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: <strong>${code}</strong></p>`,
      });
    } catch (error) {
      this.logger.error('Failed to send OTP email.', error);
    }
  }
}
