import { CommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { lastValueFrom } from 'rxjs';
import { Handler } from '@app/handler';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient, UserType } from 'src/proto/user';
import { RegisterCommand } from '../impl/register.command';
import { SendRegistrationTokenEvent } from 'src/bff-service/notify/common/dto/send-registration-token.event';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { AppConfig } from 'src/bff-service/common/configs/app.configs';

@CommandHandler(RegisterCommand)
export class RegisterHandler extends Handler<RegisterCommand, void, UserProxyServiceClient> {
  constructor(private readonly configService: TypeConfigService) {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute(command: RegisterCommand): Promise<void> {
    const { email, phone, name, surname, password } = command.input;

    const { exist } = await lastValueFrom(this.gRpcService.checkExist({ email }));
    if (exist) {
      throw new ConflictException('An account with this email already exists');
    }

    const response = await lastValueFrom(
      this.gRpcService.addUser({
        email,
        phone,
        name,
        surname,
        password,
        type: UserType.OWNER,
      }),
    );

    if (!response?.status) {
      throw new ConflictException(response?.message ?? 'Failed to create account');
    }

    const userId = response.data?.id;
    if (!userId) return;

    const ttl = this.configService.get<AppConfig>('app')?.registrationTokenTtl ?? 600;
    const token = randomUUID();

    await this.cache.saveInCache<{ userId: string; email: string }>({
      identifier: token,
      data: { userId, email },
      EX: ttl,
      prefix: 'verify-registration',
    });

    this.event.emit(new SendRegistrationTokenEvent(email, token));
  }
}
