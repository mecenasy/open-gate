import { QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { LOGIN_PROXY_SERVICE_NAME, LoginProxyServiceClient } from 'src/proto/login';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';
import { StatusAuthQuery } from '../impl/status-auth.query';
import { StatusType } from '../../dto/status.type';
import { LoginStatusType } from '../../dto/login-status.tape';
import { Handler } from '@app/handler';
import { AuthStatus } from 'src/bff-service/auth/types/login-status';

@QueryHandler(StatusAuthQuery)
export class LoginStatusHandler extends Handler<StatusAuthQuery, StatusType, LoginProxyServiceClient> {
  private userService!: UserProxyServiceClient;

  constructor() {
    super(LOGIN_PROXY_SERVICE_NAME);
  }

  override onModuleInit() {
    super.onModuleInit();
    this.userService = this.grpcClient.getService<UserProxyServiceClient>(USER_PROXY_SERVICE_NAME);
  }

  async execute({ userId }: StatusAuthQuery): Promise<LoginStatusType> {
    this.logger.log(`[loginStatus] userId=${userId ?? 'undefined'}`);
    if (!userId) {
      return {
        status: AuthStatus.logout,
      };
    }

    let data = await this.cache.getFromCache<LoginStatusType['user']>({
      identifier: userId,
      prefix: 'user-state',
    });

    // Return cached data only if it was built with the current schema (includes tenantId key).
    // Stale entries missing the key are re-fetched so tenant context resolution works.
    if (data && 'tenantId' in data) {
      return {
        status: AuthStatus.login,
        user: data,
      };
    }

    const { message, userStatus } = await lastValueFrom(this.gRpcService.getLoginStatus({ userId }));

    if (message || !userStatus) {
      return {
        status: AuthStatus.logout,
        message: 'User not found',
      };
    }

    let tenantId: string | undefined;
    try {
      const userResponse = await lastValueFrom(this.userService.getUser({ id: userId }));
      tenantId = userResponse.data?.tenantId ?? undefined;
    } catch {
      this.logger.warn(`[loginStatus] Could not fetch tenantId for userId=${userId}`);
    }

    data = {
      id: userId,
      admin: userStatus.admin,
      owner: userStatus.owner,
      email: userStatus.email,
      is2faEnabled: userStatus.is2fa,
      isAdaptiveLoginEnabled: userStatus.isAdaptive,
      tenantId,
    };

    await this.cache.saveInCache<LoginStatusType['user']>({
      identifier: userId,
      prefix: 'user-state',
      EX: 3600,
      data,
    });

    return {
      status: AuthStatus.login,
      user: data,
    };
  }
}
