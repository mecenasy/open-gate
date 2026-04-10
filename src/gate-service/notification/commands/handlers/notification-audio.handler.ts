import { Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Handler } from 'src/gate-service/common/handler/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';
import { NotificationAudioCommand } from '../impl/notification-audio.command';
import { Status } from 'src/gate-service/status/status';
import { NotifyGrpcKey } from '@app/notify-grpc';
import { OUTGOING_SIGNAL_SERVICE_NAME, OutgoingSignalServiceClient, SignalMessageType } from 'src/proto/signal';

@CommandHandler(NotificationAudioCommand)
export class NotificationAudioHandler extends Handler<NotificationAudioCommand, Status> {
  private notifyClient!: OutgoingSignalServiceClient;

  @Inject(NotifyGrpcKey)
  public readonly notifyGrpcClient!: ClientGrpc;

  onModuleInit() {
    super.onModuleInit();
    this.notifyClient = this.notifyGrpcClient.getService<OutgoingSignalServiceClient>(OUTGOING_SIGNAL_SERVICE_NAME);
  }

  async execute({ audioFile, phone }: NotificationAudioCommand): Promise<Status> {
    if (audioFile.length === 0) {
      this.logger.error('BŁĄD: Bufor audio jest pusty!');
    }

    try {
      const result = await firstValueFrom(
        this.notifyClient.sendMessage({
          source: phone,
          message: audioFile,
          type: SignalMessageType.AUDIO,
        }),
      );

      if (result.success) {
        this.logger.log(`✅ Voice message was sended to phone ${phone}`);
        return { status: true, message: 'Message was sended' };
      }

      this.logger.error(`❌ notify-service error: ${result.message}`);
      return { status: false, message: result.message };
    } catch (error) {
      this.logger.error('❌ Error:', error);
      return { status: false, message: 'Message was not sended' };
    }
  }
}
