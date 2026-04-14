import { Module } from '@nestjs/common';
import { SmsVerificationCodePlatform } from './sms-verification-code.platform';
import { TenantModule } from '@app/tenant';
import { PlatformConfigModule } from '../../../platform-config/platform-config.module';

@Module({
  imports: [TenantModule, PlatformConfigModule],
  providers: [SmsVerificationCodePlatform],
  exports: [SmsVerificationCodePlatform],
})
export class SmsModule {}
