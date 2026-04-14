import { Module } from '@nestjs/common';
import { DynamicSmtpService } from './dynamic-smtp.service';
import { MailVerificationCodePlatform } from './mail-verification-code.platform';
import { MailTokenPlatform } from './mail-token.platform';
import { TenantModule } from '@app/tenant';
import { PlatformConfigModule } from '../../../platform-config/platform-config.module';

@Module({
  imports: [TenantModule, PlatformConfigModule],
  providers: [DynamicSmtpService, MailVerificationCodePlatform, MailTokenPlatform],
  exports: [MailVerificationCodePlatform, MailTokenPlatform],
})
export class SmtpModule {}
