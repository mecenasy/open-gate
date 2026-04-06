import { Handler } from 'src/user-service/common/handler/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { NotificationTextCommand } from '../impl/notification-text.command';
import { Status } from 'src/user-service/status/status';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';

@CommandHandler(NotificationTextCommand)
export class NotificationTextHandler extends Handler<NotificationTextCommand, Status> {
  private url = `http://signal_bridge:8080/v1/send`;

  constructor(private readonly httpService: HttpService) {
    super();
  }
  async execute({ message, phone }: NotificationTextCommand): Promise<Status> {
    // TODO: dorobić pobieranie telefonu bota  z bazy i cesha
    const body = {
      message,
      number: '+48608447495',
      recipients: [phone],
    };

    try {
      await firstValueFrom(this.httpService.post(this.url, body));
      this.logger.log(`✅ Wysłano odpowiedź do ${phone}: ${message}`);

      return { status: true, message: 'Message was sended' };
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error('❌ Błąd podczas wysyłania wiadomości Signal', error.response?.data || error.message);
      }
      return { status: false, message: 'Message was not sended' };
    }
  }
}
