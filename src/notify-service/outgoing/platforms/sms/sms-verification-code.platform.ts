import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { Platform } from 'src/notify-service/types/platform';
import { VerificationCodePlatform } from '../base/verification-code-platform';
import { TenantService } from '@app/tenant';
import { PlatformConfigService, SmsCredentials } from '../../../platform-config/platform-config.service';

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

    const config = await this.resolveConfig();
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
    const tenantId = this.tenantService.getContext()?.tenantId;
    if (tenantId) {
      return this.platformConfigService.getConfig(tenantId, 'sms');
    }
    return this.platformConfigService.envFallback('sms') as SmsCredentials | null;
  }
}
