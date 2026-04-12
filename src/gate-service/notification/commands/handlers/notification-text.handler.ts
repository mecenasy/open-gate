import { Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Handler } from '@app/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';
import { NotificationTextCommand } from '../impl/notification-text.command';
import { Status } from 'src/gate-service/status/status';
import { NotifyGrpcKey } from '@app/notify-grpc';
import { OutgoingNotifyServiceClient, OUTGOING_NOTIFY_SERVICE_NAME, Type } from 'src/proto/notify';
import { PlatformTransformer } from 'src/utils/platform';

@CommandHandler(NotificationTextCommand)
export class NotificationTextHandler extends Handler<NotificationTextCommand, Status> {
  private notifyClient!: OutgoingNotifyServiceClient;

  @Inject(NotifyGrpcKey)
  public readonly notifyGrpcClient!: ClientGrpc;

  onModuleInit() {
    super.onModuleInit();
    this.notifyClient = this.notifyGrpcClient.getService<OutgoingNotifyServiceClient>(OUTGOING_NOTIFY_SERVICE_NAME);
  }

  async execute({ message, platform, phone }: NotificationTextCommand): Promise<Status> {
    console.log("🚀 ~ NotificationTextHandler ~ execute ~  message, platform, phone:", message, platform, phone)
    try {
      const result = await firstValueFrom(
        this.notifyClient.sendMessage({
          message: {
            chatId: phone,
            messageId: '',
            authorId: '',
            type: Type.Text,
            platform: PlatformTransformer.toGrpc(platform),
            content: message,
            raw: '',
          },
          platforms: [PlatformTransformer.toGrpc(platform)],
        }),
      );

      if (result.success) {
        this.logger.log(`✅ Wysłano odpowiedź do ${phone}: ${message}`);
        return { status: true, message: 'Message was sended' };
      }

      this.logger.error(`❌ notify-service error: ${result.message}`);
      return { status: false, message: result.message };
    } catch (error) {
      this.logger.error('❌ Błąd podczas wysyłania wiadomości Signal', error);
      return { status: false, message: 'Message was not sended' };
    }
  }
}
