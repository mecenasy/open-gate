import { Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Handler } from '@app/handler';
import { CommandHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';
import { NotificationAudioCommand } from '../impl/notification-audio.command';
import { Status } from 'src/core-service/status/status';
import { NotifyGrpcKey } from '@app/notify-grpc';
import { OutgoingNotifyServiceClient, OUTGOING_NOTIFY_SERVICE_NAME, Type } from 'src/proto/notify';
import { PlatformTransformer } from 'src/utils/platform';

@CommandHandler(NotificationAudioCommand)
export class NotificationAudioHandler extends Handler<NotificationAudioCommand, Status> {
  private notifyClient!: OutgoingNotifyServiceClient;

  @Inject(NotifyGrpcKey)
  public readonly notifyGrpcClient!: ClientGrpc;

  onModuleInit() {
    super.onModuleInit();
    this.notifyClient = this.notifyGrpcClient.getService<OutgoingNotifyServiceClient>(OUTGOING_NOTIFY_SERVICE_NAME);
  }

  async execute({ audioFile, platform, phone }: NotificationAudioCommand): Promise<Status> {
    if (audioFile.length === 0) {
      this.logger.error("Buffer can't be empty!");
    }

    try {
      const result = await firstValueFrom(
        this.notifyClient.sendMessage({
          message: {
            chatId: phone,
            messageId: '',
            authorId: '',
            type: Type.Audio,
            platform: PlatformTransformer.toGrpc(platform),
            media: {
              url: '',
              contentType: 'audio/ogg',
              data: audioFile,
            },
            raw: '',
          },
          platforms: [PlatformTransformer.toGrpc(platform)],
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
