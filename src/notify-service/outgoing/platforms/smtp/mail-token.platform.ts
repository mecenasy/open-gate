import { Injectable, Logger } from '@nestjs/common';
import { Platform } from 'src/notify-service/types/platform';
import { TokenType } from 'src/proto/notify';
import { TokenPlatform } from '../base/token-platform';
import { DynamicSmtpService } from './dynamic-smtp.service';

type MailContent = { subject: string; text: string; html: string };

@Injectable()
export class MailTokenPlatform extends TokenPlatform {
  platform = Platform.Email;
  private readonly logger = new Logger(MailTokenPlatform.name);

  constructor(private readonly smtp: DynamicSmtpService) {
    super();
  }

  async send(email: string, url: string, type: TokenType): Promise<void> {
    const content = this.buildContent(url, type);
    try {
      await this.smtp.sendMail({ to: email, ...content });
    } catch (error) {
      this.logger.error(`Failed to send ${TokenType[type]} email.`, error);
    }
  }

  private buildContent(url: string, type: TokenType): MailContent {
    if (type === TokenType.CONFIRM_REGISTRATION) {
      return {
        subject: 'Confirm your registration',
        text: `Welcome! Please confirm your registration by clicking the link: ${url}`,
        html: `<p>Welcome!</p><p>Please confirm your registration by clicking the link: <a href="${url}">${url}</a></p><p>If you did not create this account, you can safely ignore this email.</p>`,
      };
    }
    return {
      subject: 'Reset your password',
      text: `Reset your password: ${url}`,
      html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
    };
  }
}
