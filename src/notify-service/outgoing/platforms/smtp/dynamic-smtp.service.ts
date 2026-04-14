import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { TenantService } from '@app/tenant';
import { PlatformConfigService, SmtpCredentials } from '../../../platform-config/platform-config.service';

@Injectable()
export class DynamicSmtpService {
  private readonly logger = new Logger(DynamicSmtpService.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly platformConfigService: PlatformConfigService,
  ) {}

  async sendMail(options: Mail.Options): Promise<void> {
    const config = await this.resolveConfig();
    if (!config) {
      this.logger.warn('No SMTP config available, skipping email.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      requireTLS: true,
      auth: { user: config.user, pass: config.password },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"No Reply" <${config.from}>`,
      ...options,
    });
  }

  private async resolveConfig(): Promise<SmtpCredentials | null> {
    const tenantId = this.tenantService.getContext()?.tenantId;
    if (tenantId) {
      return this.platformConfigService.getConfig(tenantId, 'smtp');
    }
    return this.platformConfigService.envFallback('smtp') as SmtpCredentials | null;
  }
}
