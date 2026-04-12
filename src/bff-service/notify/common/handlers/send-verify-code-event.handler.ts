import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';
import { NotifyGrpcKey, type ClientGrpc } from '@app/notify-grpc';
import { OutgoingNotifyServiceClient, OUTGOING_NOTIFY_SERVICE_NAME, Platform } from 'src/proto/notify';
import { SendVerifyCodeEvent } from '../dto/send-verify-code.event';

@EventsHandler(SendVerifyCodeEvent)
export class SendVerifyCodeEventHandler implements IEventHandler<SendVerifyCodeEvent> {
  private readonly logger = new Logger(SendVerifyCodeEventHandler.name);
  private notificationService: OutgoingNotifyServiceClient;

  constructor(@Inject(NotifyGrpcKey) client: ClientGrpc) {
    this.notificationService = client.getService<OutgoingNotifyServiceClient>(OUTGOING_NOTIFY_SERVICE_NAME);
  }

  async handle({ phoneNumber, email, code }: SendVerifyCodeEvent): Promise<void> {
    try {
      await firstValueFrom(
        this.notificationService.sendVerificationCode({
          platforms: [Platform.Sms, Platform.Email],
          code,
          phoneNumber,
          email,
        }),
      );
    } catch (error) {
      this.logger.error('Failed to send verification code via notify-service.', error);
    }
  }
}
