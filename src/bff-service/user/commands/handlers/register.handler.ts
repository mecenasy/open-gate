import { CommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { lastValueFrom } from 'rxjs';
import { Handler } from '@app/handler';
import { TenantService, TenantResolutionSource } from '@app/tenant';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient, UserType } from 'src/proto/user';
import { TENANT_SERVICE_NAME, TenantServiceClient } from 'src/proto/tenant';
import { RegisterCommand } from '../impl/register.command';
import { SendRegistrationTokenEvent } from 'src/bff-service/notify/common/dto/send-registration-token.event';
import { TypeConfigService } from 'src/bff-service/common/configs/types.config.service';
import { AppConfig } from 'src/bff-service/common/configs/app.configs';

@CommandHandler(RegisterCommand)
export class RegisterHandler extends Handler<RegisterCommand, void, UserProxyServiceClient> {
  private tenantGrpcService!: TenantServiceClient;

  @Inject(TenantService)
  private readonly tenantSvc!: TenantService;

  constructor(private readonly configService: TypeConfigService) {
    super(USER_PROXY_SERVICE_NAME);
  }

  override onModuleInit() {
    super.onModuleInit();
    this.tenantGrpcService = this.grpcClient.getService<TenantServiceClient>(TENANT_SERVICE_NAME);
  }

  async execute(command: RegisterCommand): Promise<void> {
    const { email, phone, name, surname, password, tenantSlug } = command.input;

    const { exist } = await lastValueFrom(this.gRpcService.checkExist({ email }));
    if (exist) {
      throw new ConflictException('An account with this email already exists');
    }

    const tenant = await lastValueFrom(this.tenantGrpcService.createTenant({ slug: tenantSlug }));

    await this.tenantSvc.runInContext(
      {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        schemaName: tenant.schemaName,
        correlationId: '',
        resolutionSource: TenantResolutionSource.HEADER,
      },
      async () => {
        const response = await lastValueFrom(
          this.gRpcService.addUser({
            email,
            phone,
            name,
            surname,
            password,
            type: UserType.OWNER,
            tenantId: tenant.id,
          }),
        );

        if (!response?.status) {
          throw new ConflictException(response?.message ?? 'Failed to create owner account');
        }

        const userId = response.data?.id;
        if (userId) {
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
      },
    );
  }
}
