import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { QueueMessageToAudioData } from '../../common/types/queue-message-data';
import { QueueType } from '@app/redis';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';
import { GoogleService } from '../services/google.service';
import { ProcessorBase } from '../processor-base';
import { keys } from 'src/gate-service/message-keys/keys';

@Processor(QueueType.Speech)
export class SpeechProcessor extends ProcessorBase {
  constructor(private readonly googleService: GoogleService) {
    super();
  }

  @Process(QueueType.Speech)
  async analyzeAudio(job: Job<QueueMessageToAudioData>) {
    const { context, message } = job.data;

    try {
      const audioBuffer = await this.googleService.textToSpeech(message.toString());

      this.eventService.emit(new NotificationEvent(context.phone, audioBuffer, 'audio'));
    } catch (error) {
      this.eventService.emit(
        new NotificationEvent(context.phone, await this.getMessage(keys.speechProcessorKey)),
        'text',
      );
      this.logger.error('Error generating speech:', error);
    }
  }
}
