import { Injectable, Logger } from '@nestjs/common';
import { Sender } from '../sender';
import { Platform } from 'src/notify-service/types/platform';
import { Type, UnifiedMessage } from 'src/notify-service/types/unified-message';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import { TenantService } from '@app/tenant';
import { PlatformConfigService, SignalCredentials } from '../../../platform-config/platform-config.service';

@Injectable()
export class SignalSender extends Sender {
  platform: Platform = Platform.Signal;
  private readonly logger = new Logger(SignalSender.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly tenantService: TenantService,
    private readonly platformConfigService: PlatformConfigService,
  ) {
    super();
  }

  async send(data: UnifiedMessage): Promise<void> {
    const { chatId, content, media, type } = data;

    try {
      if (!chatId) {
        throw new Error('Missing chatId');
      }

      const config = await this.resolveConfig();
      if (!config) {
        this.logger.warn(`No Signal config found for tenant, skipping send to ${chatId}`);
        return;
      }

      if (type === Type.Audio) {
        if (!media?.data) throw new Error('Missing audio data');
        await this.sendAudio(config, chatId, media.data);
      } else {
        if (!content) throw new Error('Missing content');
        await this.sendText(config, chatId, content);
      }

      this.logger.log(`✅ Signal message sent to ${chatId}`);
    } catch (error) {
      const detail = isAxiosError(error) ? JSON.stringify(error.response?.data ?? error.message) : String(error);
      this.logger.error(`❌ Failed to send Signal message to ${chatId}: ${detail}`);
    }
  }

  private async resolveConfig(): Promise<SignalCredentials | null> {
    const tenantId = this.tenantService.getContext()?.tenantId;
    if (tenantId) {
      return this.platformConfigService.getConfig(tenantId, 'signal');
    }
    // No tenant context — use env fallback via PlatformConfigService
    return this.platformConfigService.envFallback('signal') as SignalCredentials | null;
  }

  private async sendText(config: SignalCredentials, phone: string, text: string): Promise<void> {
    await firstValueFrom(
      this.httpService.post(`${config.apiUrl}/v1/send`, {
        message: text,
        number: config.account,
        recipients: [phone],
      }),
    );
  }

  private async sendAudio(config: SignalCredentials, phone: string, audioFile: Buffer): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${config.apiUrl}/v2/send`,
        {
          number: config.account,
          recipients: [phone],
          message: '',
          base64_attachments: [`data:audio/aac;base64,${audioFile.toString('base64')}`],
          is_voice_note: true,
        },
        { headers: { 'Content-Type': 'application/json' } },
      ),
    );
  }
}
