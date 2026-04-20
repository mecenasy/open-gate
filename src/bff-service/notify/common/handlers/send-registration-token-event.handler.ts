import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';
import { NotifyGrpcKey, type ClientGrpc } from '@app/notify-grpc';
import { OutgoingNotifyServiceClient, OUTGOING_NOTIFY_SERVICE_NAME, Platform, TokenType } from 'src/proto/notify';
import { SendRegistrationTokenEvent } from '../dto/send-registration-token.event';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { AppConfig } from 'src/bff-service/common/configs/app.configs';

@EventsHandler(SendRegistrationTokenEvent)
export class SendRegistrationTokenEventHandler implements IEventHandler<SendRegistrationTokenEvent> {
  private readonly logger = new Logger(SendRegistrationTokenEventHandler.name);
  private notificationService: OutgoingNotifyServiceClient;

  constructor(
    @Inject(NotifyGrpcKey) client: ClientGrpc,
    private readonly configService: TypeConfigService,
  ) {
    this.notificationService = client.getService<OutgoingNotifyServiceClient>(OUTGOING_NOTIFY_SERVICE_NAME);
  }

  async handle({ email, token }: SendRegistrationTokenEvent): Promise<void> {
    const frontendUrl = this.configService.get<AppConfig>('app')?.clientUrl;
    const url = `${frontendUrl}/confirm-registration?token=${token}`;

    try {
      await firstValueFrom(
        this.notificationService.sendToken({
          platforms: [Platform.Email],
          email,
          url,
          type: TokenType.CONFIRM_REGISTRATION,
        }),
      );
    } catch (error) {
      this.logger.error('Failed to send registration token via notify-service.', error);
    }
  }
}
