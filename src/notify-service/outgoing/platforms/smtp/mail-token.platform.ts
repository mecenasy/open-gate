import { Injectable, Logger } from '@nestjs/common';
import { Platform } from 'src/notify-service/types/platform';
import { TokenPlatform } from '../base/token-platform';
import { DynamicSmtpService } from './dynamic-smtp.service';

@Injectable()
export class MailTokenPlatform extends TokenPlatform {
  platform = Platform.Email;
  private readonly logger = new Logger(MailTokenPlatform.name);

  constructor(private readonly smtp: DynamicSmtpService) {
    super();
  }

  async send(email: string, url: string): Promise<void> {
    try {
      await this.smtp.sendMail({
        to: email,
        subject: 'Reset your password',
        text: `Reset your password: ${url}`,
        html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
      });
    } catch (error) {
      this.logger.error('Failed to send reset password email.', error);
    }
  }
}
