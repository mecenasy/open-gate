import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { smsConfig } from './config/sms.configs';
import { SmsVerificationCodePlatform } from './sms-verification-code.platform';

@Module({
  imports: [ConfigModule.forFeature(smsConfig)],
  providers: [SmsVerificationCodePlatform],
  exports: [SmsVerificationCodePlatform],
})
export class SmsModule {}
