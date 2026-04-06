import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user.service';
import { AdaptiveRequest, AdaptiveResponse, TfaResponse, TfaResponse_Status } from 'src/proto/user-settings';
import { UserSettings } from './entity/user-settings.entity';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly repository: Repository<UserSettings>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  public async verify2fa(id: string, secret: string): Promise<TfaResponse> {
    const user = await this.userService.findUserSettingsById(id);

    if (!user) {
      return {
        status: TfaResponse_Status.FAIL,
        message: 'User not found',
      };
    }

    user.userSettings.isTwoFactorEnabled = true;
    user.userSettings.twoFactorSecret = secret;

    await this.userService.save(user);

    return {
      status: TfaResponse_Status.OK,
    };
  }

  public async reject2fa(id: string): Promise<TfaResponse> {
    const user = await this.userService.findUserSettingsById(id);

    if (!user) {
      return {
        status: TfaResponse_Status.FAIL,
        message: 'User not found',
      };
    }

    user.userSettings.isTwoFactorEnabled = false;
    user.userSettings.twoFactorSecret = null;

    await this.userService.save(user);

    return {
      status: TfaResponse_Status.OK,
    };
  }

  public async acceptAdaptive({ id }: AdaptiveRequest): Promise<AdaptiveResponse> {
    const user = await this.userService.findUserSettingsById(id);
    const active = !user.userSettings.isAdaptiveAuthEnabled;
    user.userSettings.isAdaptiveAuthEnabled = active;

    await this.userService.save(user);

    return { active };
  }

  public create() {
    return this.repository.create();
  }
}
