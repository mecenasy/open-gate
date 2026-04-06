import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  constructor(private readonly httpService: HttpService) {}

  async textToSpeech(text: string, language: string = 'pl'): Promise<Buffer> {
    const url = this.generateTtsUrl(text, language);

    try {
      const { data } = await lastValueFrom(
        this.httpService.get<Buffer>(url, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }),
      );

      return Buffer.from(data);
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error('Google TTS API error:', error.message);
        throw new Error(`Failed to generate speech: ${error.message}`);
      } else {
        this.logger.error('Unexpected error in Google TTS:', error);
        throw new Error('Unexpected error occurred while generating speech');
      }
    }
  }

  private generateTtsUrl(text: string, language: string): string {
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${language}&client=tw-ob`;
  }
}
