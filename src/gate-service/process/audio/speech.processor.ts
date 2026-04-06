import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { QueueMessageToAudioData } from '../../common/types/queue-message-data';
import { Logger } from '@nestjs/common';
import { CacheService } from '../../common/cache/cache.service';
import { EventService } from '../../common/event/event.service';
import { NotificationEvent } from 'src/user-service/notification/events/notification.event';
import { QueueType } from 'src/user-service/queue/types';
import { OnModuleInit } from '@nestjs/common';
import { GoogleService } from '../services/google.service';

@Processor(QueueType.Speech)
export class SpeechProcessor implements OnModuleInit {
  logger: Logger;
  constructor(
    private readonly cache: CacheService,
    private readonly eventService: EventService,
    private readonly googleService: GoogleService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  onModuleInit() {
    this.logger.log('SpeechProcessor initialized');
  }

  @Process(QueueType.Speech)
  async analizeAudio(job: Job<QueueMessageToAudioData>) {
    this.logger.debug('Analyzing message');
    const { context, message } = job.data;

    try {
      const audioBuffer = await this.googleService.textToSpeech(message.toString());

      this.eventService.emit(new NotificationEvent(context.phone, audioBuffer, 'audio'));
    } catch (error) {
      // TODO: wysłać informację, by użytkownik wybrał metodę command
      this.eventService.emit(
        new NotificationEvent(context.phone, 'Przepraszam złapałem zadyszkę i nie umiem ci odpowiedzieć ', 'text'),
      );
      this.logger.error('Error generating speech:', error);
    }
  }
}
