import { registerAs } from '@nestjs/config';

export interface SmsConfig {
  sid: string;
  token: string;
  phone: string;
}

export const smsConfig = registerAs(
  'sms',
  (): SmsConfig => ({
    sid: process.env.TWILO_SID ?? '',
    token: process.env.TWILO_TOKEN ?? '',
    phone: process.env.TWILO_PHONE ?? '',
  }),
);
