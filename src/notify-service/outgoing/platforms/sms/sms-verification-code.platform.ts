import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { Platform } from 'src/notify-service/types/platform';
import { VerificationCodePlatform } from '../base/verification-code-platform';
import { TenantService } from '@app/tenant';
import {
  DEFAULT_PLATFORM_FALLBACK_ID,
  PlatformConfigService,
  SmsCredentials,
} from '../../../platform-config/platform-config.service';

@Injectable()
export class SmsVerificationCodePlatform extends VerificationCodePlatform {
  platform = Platform.Sms;
  private readonly logger = new Logger(SmsVerificationCodePlatform.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly platformConfigService: PlatformConfigService,
  ) {
    super();
  }

  async send({ phoneNumber }: { phoneNumber?: string; email?: string }, code: number): Promise<void> {
    console.log("🚀 ~ SmsVerificationCodePlatform ~ send ~ phoneNumber:", phoneNumber)
    if (!phoneNumber) {
      this.logger.warn('SMS platform: phoneNumber is missing, skipping.');
      return;
    }

    const config = await this.resolveConfig();
    console.log('🚀 ~ SmsVerificationCodePlatform ~ send ~ config:', config);
    if (!config) {
      this.logger.warn(`No SMS config for tenant, skipping send to ${phoneNumber}`);
      return;
    }

    try {
      const client = new Twilio(config.sid, config.token);
      await client.messages.create({
        body: `Your code is: ${code}`,
        from: config.phone,
        to: phoneNumber,
      });
    } catch (error) {
      this.logger.error('Failed to send SMS.', error);
    }
  }

  private async resolveConfig(): Promise<SmsCredentials | null> {
    const tenantId = this.tenantService.getContext()?.tenantId ?? DEFAULT_PLATFORM_FALLBACK_ID;
    return this.platformConfigService.getConfig(tenantId, 'sms');
  }
}
