import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GrpcNotifyProxyKey } from 'src/bff-service/common/proxy/constance';
import { NotificationServiceClient, NOTIFICATION_SERVICE_NAME } from 'src/proto/notification';
import { SmsCodeCommand } from '../impl/sms-code.command';

@CommandHandler(SmsCodeCommand)
export class SmsCodeHandler implements ICommandHandler<SmsCodeCommand> {
  private readonly logger = new Logger(SmsCodeHandler.name);
  private notificationService: NotificationServiceClient;

  constructor(@Inject(GrpcNotifyProxyKey) private readonly client: ClientGrpc) {
    this.notificationService = this.client.getService<NotificationServiceClient>(NOTIFICATION_SERVICE_NAME);
  }

  async execute({ code, phoneNumber }: SmsCodeCommand) {
    try {
      await firstValueFrom(this.notificationService.sendSms({ phoneNumber, code }));
    } catch (error) {
      this.logger.error('Failed to send SMS via notify-service.', error);
    }
  }
}
