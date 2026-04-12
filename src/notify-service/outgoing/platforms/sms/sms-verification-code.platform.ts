import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { Platform } from 'src/notify-service/types/platform';
import { VerificationCodePlatform } from '../base/verification-code-platform';
import { SmsConfig } from './config/sms.configs';

@Injectable()
export class SmsVerificationCodePlatform extends VerificationCodePlatform {
  platform = Platform.Sms;
  private client: Twilio;
  private readonly logger = new Logger(SmsVerificationCodePlatform.name);

  constructor(private readonly configService: ConfigService) {
    super();
    const config = this.configService.get<SmsConfig>('sms');
    this.client = new Twilio(config?.sid, config?.token);
  }

  async send({ phoneNumber }: { phoneNumber?: string; email?: string }, code: number): Promise<void> {
    if (!phoneNumber) {
      this.logger.warn('SMS platform: phoneNumber is missing, skipping.');
      return;
    }

    const phone = this.configService.get<SmsConfig>('sms')?.phone;
    try {
      await this.client.messages.create({
        body: `Your code is: ${code}`,
        from: phone,
        to: phoneNumber,
      });
    } catch (error) {
      this.logger.error('Failed to send SMS.', error);
    }
  }
}
