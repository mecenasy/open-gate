import { Handler } from 'src/user-service/common/handler/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { NotificationAudioCommand } from '../impl/notification-audio.command';
import { Status } from 'src/user-service/status/status';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { isAxiosError } from 'axios';

@CommandHandler(NotificationAudioCommand)
export class NotificationAudioHandler extends Handler<NotificationAudioCommand, Status> {
  private url = `http://signal_bridge:8080/v2/send`;

  constructor(private readonly httpService: HttpService) {
    super();
  }
  async execute({ audioFile, phone }: NotificationAudioCommand): Promise<Status> {
    // TODO: dorobić pobieranie telefonu bota  z bazy i cache
    if (audioFile.length === 0) {
      this.logger.error('BŁĄD: Bufor audio jest pustY!');
    }
    const body = {
      number: '+48608447495',
      recipients: [phone],
      message: '',
      base64_attachments: [`data:audio/aac;base64,${audioFile.toString('base64')}`],
      is_voice_note: true,
    };

    try {
      await firstValueFrom(
        this.httpService.post(this.url, body, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`✅ Voice message was sended to phone ${phone}`);
      return { status: true, message: 'Message was sended' };
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error('❌ Error :', error.response?.data || error.message);
      }
      return { status: false, message: 'Message was not sended' };
    }
  }
}
