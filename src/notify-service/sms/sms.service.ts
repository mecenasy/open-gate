import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { SmsConfig } from './config/sms.configs';

@Injectable()
export class SmsService {
  private client: Twilio;
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<SmsConfig>('sms');
    this.client = new Twilio(config?.sid, config?.token);
  }

  async sendCode(phoneNumber: string, code: number): Promise<void> {
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
