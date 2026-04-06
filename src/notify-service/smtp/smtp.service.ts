import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationCode(email: string, code: number): Promise<void> {
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

  async sendResetToken(email: string, url: string): Promise<void> {
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
