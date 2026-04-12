import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Platform } from 'src/notify-service/types/platform';
import { TokenPlatform } from '../base/token-platform';

@Injectable()
export class MailTokenPlatform extends TokenPlatform {
  platform = Platform.Email;
  private readonly logger = new Logger(MailTokenPlatform.name);

  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async send(email: string, url: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your password',
        template: './reset-password',
        context: { url },
      });
    } catch (error) {
      this.logger.error('Failed to send reset password email.', error);
    }
  }
}
