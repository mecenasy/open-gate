import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Platform } from 'src/notify-service/types/platform';
import { VerificationCodePlatform } from '../base/verification-code-platform';

@Injectable()
export class MailVerificationCodePlatform extends VerificationCodePlatform {
  platform = Platform.Email;
  private readonly logger = new Logger(MailVerificationCodePlatform.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async send({ email }: { phoneNumber?: string; email?: string }, code: number): Promise<void> {
    if (!email) {
      this.logger.warn('Mail platform: email is missing, skipping.');
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your verification code',
        template: './verification',
        context: { code: code.toString() },
      });
    } catch (error) {
      this.logger.error('Failed to send OTP email.', error);
    }
  }
}
