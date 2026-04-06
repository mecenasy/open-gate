import { Controller } from '@nestjs/common';
import { LoginService } from './login.service';
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

@Controller()
export class LoginController implements LoginProxyServiceController {
  constructor(private readonly loginService: LoginService) {}

  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'Login')
  async login(request: LoginRequest): Promise<LoginResponse> {
    return await this.loginService.login(request.email, request.password);
  }

  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'GetLoginStatus')
  async getLoginStatus(request: LoginStatusRequest): Promise<LoginStatusResponse> {
    return await this.loginService.getLoginStatus(request.userId);
  }

  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'ResetPassword')
  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return await this.loginService.resetPassword(request.email, request.password);
  }

  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'ChangePassword')
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return await this.loginService.changePassword(request.userId, request.oldPassword, request.newPassword);
  }
  @GrpcMethod(LOGIN_PROXY_SERVICE_NAME, 'GetUser2FaSecret')
  async getUser2FaSecret(request: Verify2FARequest): Promise<Verify2FAResponse> {
    return await this.loginService.getUser2FaSecret(request.login);
  }
}
