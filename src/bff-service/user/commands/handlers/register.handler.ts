import { CommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Handler } from '@app/handler';
import { TenantService, TenantResolutionSource } from '@app/tenant';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient, UserType } from 'src/proto/user';
import { TENANT_SERVICE_NAME, TenantServiceClient } from 'src/proto/tenant';
import { RegisterCommand } from '../impl/register.command';

@CommandHandler(RegisterCommand)
export class RegisterHandler extends Handler<RegisterCommand, void, UserProxyServiceClient> {
  private tenantGrpcService!: TenantServiceClient;

  @Inject(TenantService)
  private readonly tenantSvc!: TenantService;

  constructor() {
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
          }),
        );

        if (!response?.status) {
          throw new ConflictException(response?.message ?? 'Failed to create owner account');
        }
      },
    );
  }
}
