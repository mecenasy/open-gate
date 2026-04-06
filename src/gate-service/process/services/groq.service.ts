import { Injectable, Logger } from '@nestjs/common';
import Groq, { RateLimitError, APIConnectionError, toFile } from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly groq: Groq;

  constructor() {
    this.groq = new Groq();
  }

  async createChatCompletion(messages: ChatCompletionMessageParam[]): Promise<string> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        response_format: { type: 'json_object' },
      });

      return chatCompletion.choices[0].message.content || '';
    } catch (error) {
      if (error instanceof RateLimitError) {
        // TODO: dorobić alarm w systemie monitorującym o wyczerpaniu tokenów
        this.logger.warn('Rate limit exceeded for Groq API.');
        throw new Error('Rate limit exceeded');
      } else if (error instanceof APIConnectionError) {
        this.logger.error(`Groq API connection error (${error.status}):`, error.message);
        throw new Error('API connection error');
      } else {
        this.logger.error('Unexpected error in Groq service:', error);
        throw new Error('Unexpected error');
      }
    }
  }

  async createTranscription(mp3Buffer: Buffer<ArrayBufferLike>): Promise<string> {
    const file = await toFile(mp3Buffer, 'speech.mp3', { type: 'audio/mpeg' });

    try {
      const transcription = await this.groq.audio.transcriptions.create({
        file,
        model: 'whisper-large-v3-turbo',
      });

      return transcription.text;
    } catch (error) {
      if (error instanceof RateLimitError) {
        // TODO: dorobić alarm w systemie monitorującym o wyczerpaniu tokenów
        this.logger.warn('Rate limit exceeded for Groq API.');
        throw new Error('Rate limit exceeded');
      } else if (error instanceof APIConnectionError) {
        this.logger.error(`Groq API connection error (${error.status}):`, error.message);
        throw new Error('API connection error');
      } else {
        this.logger.error('Unexpected error in Groq service:', error);
        throw new Error('Unexpected error');
      }
    }
  }
}
