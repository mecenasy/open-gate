import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { NotifyGrpcKey, type ClientGrpc } from '@app/notify-grpc';
import { NotificationServiceClient, NOTIFICATION_SERVICE_NAME } from 'src/proto/notification';
import { MailCodeCommand } from '../impl/mail-code.command';

@CommandHandler(MailCodeCommand)
export class MailCodeHandler implements ICommandHandler<MailCodeCommand> {
  private readonly logger = new Logger(MailCodeHandler.name);
  private notificationService: NotificationServiceClient;

  constructor(@Inject(NotifyGrpcKey) private readonly client: ClientGrpc) {
    this.notificationService = this.client.getService<NotificationServiceClient>(NOTIFICATION_SERVICE_NAME);
  }

  async execute({ code, email }: MailCodeCommand) {
    try {
      await firstValueFrom(this.notificationService.sendMailCode({ email, code }));
    } catch (error) {
      this.logger.error('Failed to send mail code via notify-service.', error);
    }
  }
}
