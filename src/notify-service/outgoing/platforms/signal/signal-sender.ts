import { Injectable, Logger } from '@nestjs/common';
import { Sender } from '../sender';
import { Platform } from 'src/notify-service/types/platform';
import { Type, UnifiedMessage } from 'src/notify-service/types/unified-message';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';

@Injectable()
export class SignalSender extends Sender {
  platform: Platform = Platform.Signal;

  private logger: Logger;
  // TODO : mow to config
  private baseUrl = process.env.SIGNAL_API_URL ?? 'http://signal_bridge:8080';
  private botNumber = process.env.SIGNAL_ACCOUNT ?? '+48608447495';

  constructor(private readonly httpService: HttpService) {
    super();
    this.logger = new Logger(SignalSender.name);
  }

  async send(data: UnifiedMessage): Promise<void> {
    const { chatId, content, media, type } = data;

    try {
      if (!chatId) {
        throw new Error('Missing chatId or content');
      }

      if (type === Type.Audio) {
        if (!media?.data) {
          throw new Error('Missing audio data');
        }
        await this.sendAudio(chatId, media.data);
      } else {
        if (!content) {
          throw new Error('Missing content');
        }
        await this.sendText(chatId, content);
      }

      this.logger.log(`✅ Signal message sent to ${chatId}`);
    } catch (error) {
      const detail = isAxiosError(error) ? JSON.stringify(error.response?.data ?? error.message) : String(error);
      this.logger.error(`❌ Failed to send Signal message to ${chatId}: ${detail}`);
    }
  }

  private async sendText(phone: string, text: string): Promise<void> {
    await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/v1/send`, {
        message: text,
        number: this.botNumber,
        recipients: [phone],
      }),
    );
  }

  private async sendAudio(phone: string, audioFile: Buffer): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/v2/send`,
        {
          number: this.botNumber,
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
