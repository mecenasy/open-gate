import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GrpcNotifyProxyKey } from 'src/bff-service/common/proxy/constance';
import { NotificationServiceClient, NOTIFICATION_SERVICE_NAME } from 'src/proto/notification';
import { ResetTokenCommand } from '../impl/reset-token.command';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { AppConfig } from 'src/bff-service/common/configs/app.configs';

@CommandHandler(ResetTokenCommand)
export class ResetTokenHandler implements ICommandHandler<ResetTokenCommand> {
  private readonly logger = new Logger(ResetTokenHandler.name);
  private notificationService: NotificationServiceClient;

  constructor(
    @Inject(GrpcNotifyProxyKey) private readonly client: ClientGrpc,
    private readonly configService: TypeConfigService,
  ) {
    this.notificationService = this.client.getService<NotificationServiceClient>(NOTIFICATION_SERVICE_NAME);
  }

  async execute({ token, email }: ResetTokenCommand) {
    const frontendUrl = this.configService.get<AppConfig>('app')?.clientUrl;
    const url = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await firstValueFrom(this.notificationService.sendResetToken({ email, url }));
    } catch (error) {
      this.logger.error('Failed to send reset token via notify-service.', error);
    }
  }
}
