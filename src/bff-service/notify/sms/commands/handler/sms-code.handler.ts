import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { NotifyGrpcKey, type ClientGrpc } from '@app/notify-grpc';
import { OutgoingNotifyServiceClient, OUTGOING_NOTIFY_SERVICE_NAME } from 'src/proto/notify';
import { SmsCodeCommand } from '../impl/sms-code.command';

@CommandHandler(SmsCodeCommand)
export class SmsCodeHandler implements ICommandHandler<SmsCodeCommand> {
  private readonly logger = new Logger(SmsCodeHandler.name);
  private notificationService: OutgoingNotifyServiceClient;

  constructor(@Inject(NotifyGrpcKey) private readonly client: ClientGrpc) {
    this.notificationService = this.client.getService<OutgoingNotifyServiceClient>(OUTGOING_NOTIFY_SERVICE_NAME);
  }

  async execute({ code, phoneNumber }: SmsCodeCommand) {
    try {
      await firstValueFrom(this.notificationService.sendSmsCode({ phoneNumber, code }));
    } catch (error) {
      this.logger.error('Failed to send SMS via notify-service.', error);
    }
  }
}
