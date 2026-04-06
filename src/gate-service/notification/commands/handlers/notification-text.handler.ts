import { Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Handler } from 'src/gate-service/common/handler/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';
import { NotificationTextCommand } from '../impl/notification-text.command';
import { Status } from 'src/gate-service/status/status';
import { NotifyGrpcKey } from 'src/gate-service/common/signal-grpc.module';
import { OUTGOING_SIGNAL_SERVICE_NAME, OutgoingSignalServiceClient, SignalMessageType } from 'src/proto/signal';

@CommandHandler(NotificationTextCommand)
export class NotificationTextHandler extends Handler<NotificationTextCommand, Status> {
  private notifyClient!: OutgoingSignalServiceClient;

  @Inject(NotifyGrpcKey)
  public readonly notifyGrpcClient!: ClientGrpc;

  onModuleInit() {
    super.onModuleInit();
    this.notifyClient = this.notifyGrpcClient.getService<OutgoingSignalServiceClient>(OUTGOING_SIGNAL_SERVICE_NAME);
  }

  async execute({ message, phone }: NotificationTextCommand): Promise<Status> {
    try {
      const result = await firstValueFrom(
        this.notifyClient.sendMessage({
          source: phone,
          message: Buffer.from(message, 'utf-8'),
          type: SignalMessageType.TEXT,
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
