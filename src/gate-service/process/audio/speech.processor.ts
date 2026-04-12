import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { QueueMessageToAudioData } from '../../common/types/queue-message-data';
import { QueueType } from '@app/redis';
import { NotificationEvent } from 'src/gate-service/notification/events/notification.event';
import { GoogleService } from '../services/google.service';
import { ProcessorBase } from '../processor-base';
import { keys } from 'src/gate-service/message-keys/keys';
import { Type } from 'src/notify-service/types/unified-message';

@Processor(QueueType.Speech)
export class SpeechProcessor extends ProcessorBase {
  constructor(private readonly googleService: GoogleService) {
    super();
  }

  @Process(QueueType.Speech)
  async analyzeAudio(job: Job<QueueMessageToAudioData>) {
    this.logger.debug('Analyzing Audio message');
    const { context, message, platform } = job.data;

    try {
      const audioBuffer = await this.googleService.textToSpeech(message.toString());
      this.eventService.emit(
        new NotificationEvent({ phone: context.phone, message: audioBuffer, platform }, Type.Audio),
      );
    } catch (error) {
      this.eventService.emit(
        new NotificationEvent({
          phone: context.phone,
          message: await this.getMessage(keys.speechProcessorKey),
          platform,
        }),
      );
      this.logger.error('Error generating speech:', error);
    }
  }
}
