import { Injectable } from '@nestjs/common';
import { PasswordService } from 'src/db-service/user/password/password.service';
import { UserType } from 'src/db-service/user/user-type';
import { UserStatus } from 'src/db-service/user/status';
import { UserService } from 'src/db-service/user/user.service';
import { ChangePasswordResponse, LoginResponse, LoginStatusResponse, ResetPasswordResponse } from 'src/proto/login';

@Injectable()
export class LoginService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userService.findUserWithPassword(email);
    console.log("🚀 ~ LoginService ~ login ~ user:", user)
    if (!user || !user.password) {
      return { success: false, message: 'Unknown user' };
    }

    const role = user.userRole?.userType;
    if (role !== UserType.Owner && role !== UserType.SuperUser) {
      return { success: false, message: 'Access denied' };
    }

    if (user.status === UserStatus.Pending) {
      return { success: false, message: 'REGISTRATION_PENDING_CONFIRMATION' };
    }

    const isPasswordValid = this.passwordService.validatePassword(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        userId: user.id,
        message: 'Invalid password or login',
      };
    }

    return {
      success: true,
      message: 'Login successful',
      phone: user.phone,
      is2fa: user.userSettings.isTwoFactorEnabled,
      isAdaptive: user.userSettings.isAdaptiveAuthEnabled,
      userId: user.id,
    };
  }

  async getLoginStatus(userId: string): Promise<LoginStatusResponse> {
    const user = await this.userService.findUserSettingsById(userId);
    if (!user) {
      return { message: 'Unknown user' };
    }
    return {
      userStatus: {
        admin: user.userRole.userType === UserType.SuperUser || user.userRole.userType === UserType.Owner,
        owner: user.userRole.userType === UserType.Owner,
        email: user.email,
        isAdaptive: user.userSettings.isAdaptiveAuthEnabled,
        is2fa: user.userSettings.isTwoFactorEnabled,
      },
    };
  }

  async resetPassword(email: string, password: string): Promise<ResetPasswordResponse> {
    const user = await this.userService.findUserWithPassword(email);

    if (!user) {
      return { success: false, message: 'Unknown user' };
    }

    const hashedPassword = this.passwordService.createPassword(password);
    user.password = hashedPassword;

    await this.userService.save(user);
    return { success: true, message: 'Password changed successfully' };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ChangePasswordResponse> {
    const user = await this.userService.findUserWithPasswordById(userId);

    if (!user || !user.password) {
      return { success: false, message: 'Unknown user' };
    }

    const isPasswordValid = this.passwordService.validatePassword(oldPassword, user.password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password' };
    }

    const hashedPassword = this.passwordService.createPassword(newPassword);
    user.password = hashedPassword;

    await this.userService.save(user);
    return { success: true, message: 'Password changed successfully' };
  }

  async getUser2FaSecret(email: string) {
    const user = await this.userService.findUserSettings(email);

    if (!user || !user.userSettings.twoFactorSecret) {
      return {
        secret: '',
        userId: '',
      };
    }

    console.log('🚀 ~ LoginService ~ getUser2FaSecret ~ user:', user);

    return {
      secret: user.userSettings.twoFactorSecret,
      userId: user.id,
    };
  }
}
