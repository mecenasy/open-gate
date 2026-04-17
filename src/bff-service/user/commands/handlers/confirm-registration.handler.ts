import { CommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Handler } from '@app/handler';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient, Status } from 'src/proto/user';
import { ConfirmRegistrationCommand } from '../impl/confirm-registration.command';
import { SuccessResponseType } from '../../dto/response.type';

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationHandler extends Handler<
  ConfirmRegistrationCommand,
  SuccessResponseType,
  UserProxyServiceClient
> {
  constructor() {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute({ token }: ConfirmRegistrationCommand): Promise<SuccessResponseType> {
    const data = await this.cache.getFromCache<{ userId: string; email: string }>({
      identifier: token,
      prefix: 'verify-registration',
    });

    if (!data) {
      throw new BadRequestException('REGISTRATION_TOKEN_EXPIRED');
    }

    await this.cache.removeFromCache({ identifier: token, prefix: 'verify-registration' });

    await lastValueFrom(this.gRpcService.updateUserStatus({ id: data.userId, status: Status.ACTIVE }));

    return { success: true };
  }
}
