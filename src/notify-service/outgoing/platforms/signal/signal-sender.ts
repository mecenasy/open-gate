import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sender } from '../sender';
import { Platform } from 'src/notify-service/types/platform';
import { Type, UnifiedMessage } from 'src/notify-service/types/unified-message';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import type { SignalConfig } from './config/signal.config';

@Injectable()
export class SignalSender extends Sender {
  platform: Platform = Platform.Signal;

  private logger: Logger;
  private readonly baseUrl: string;
  private readonly botNumber: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.logger = new Logger(SignalSender.name);
    this.baseUrl = this.configService.get<SignalConfig>('signal')!.apiUrl;
    this.botNumber = this.configService.get<SignalConfig>('signal')!.account;
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
