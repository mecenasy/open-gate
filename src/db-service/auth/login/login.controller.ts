import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LOGIN_PROXY_SERVICE_NAME, LoginProxyServiceController } from 'src/proto/login';
import type {
  LoginStatusRequest,
  LoginRequest,
  LoginResponse,
  LoginStatusResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ResetPasswordResponse,
  ChangePasswordResponse,
  Verify2FARequest,
  Verify2FAResponse,
} from 'src/proto/login';
import { GrpcMethod } from '@nestjs/microservices';
import { LoginQuery } from './queries/impl/login.query';
import { GetLoginStatusQuery } from './queries/impl/get-login-status.query';
import { GetUser2FaSecretQuery } from './queries/impl/get-user-2fa-secret.query';
import { ResetPasswordCommand } from './commands/impl/reset-password.command';
import { ChangePasswordCommand } from './commands/impl/change-password.command';

@Controller()
export class LoginController implements LoginProxyServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'Login')
  login(request: LoginRequest): Promise<LoginResponse> {
    return this.queryBus.execute(new LoginQuery(request.email, request.password));
  }

  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'GetLoginStatus')
  getLoginStatus(request: LoginStatusRequest): Promise<LoginStatusResponse> {
    return this.queryBus.execute(new GetLoginStatusQuery(request.userId));
  }

  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'ResetPassword')
  resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.commandBus.execute(new ResetPasswordCommand(request.email, request.password));
  }

  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'ChangePassword')
  changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return this.commandBus.execute(new ChangePasswordCommand(request.userId, request.oldPassword, request.newPassword));
  }

  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'GetUser2FaSecret')
  getUser2FaSecret(request: Verify2FARequest): Promise<Verify2FAResponse> {
    return this.queryBus.execute(new GetUser2FaSecretQuery(request.login));
  }
}
