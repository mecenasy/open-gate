import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { Platform } from 'src/notify-service/types/platform';
import { VerificationCodePlatform } from '../base/verification-code-platform';
import { TenantService } from '@app/tenant';
import { DEFAULT_PLATFORM_FALLBACK_ID, PlatformConfigService } from '../../../platform-config/platform-config.service';

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
    if (!phoneNumber) {
      this.logger.warn('SMS platform: phoneNumber is missing, skipping.');
      return;
    }

    const tenantId = this.tenantService.getContext()?.tenantId ?? DEFAULT_PLATFORM_FALLBACK_ID;
    const creds = await this.platformConfigService.resolveSmsCredentials(tenantId);
    if (!creds) {
      this.logger.warn(`No usable SMS credentials for tenant ${tenantId}, skipping send to ${phoneNumber}`);
      return;
    }

    try {
      const client = new Twilio(creds.sid, creds.token);
      await client.messages.create({
        body: `Your code is: ${code}`,
        from: creds.phone,
        to: phoneNumber,
      });
    } catch (error) {
      this.logger.error('Failed to send SMS.', error);
    }
  }
}
