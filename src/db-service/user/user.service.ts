import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { AddUserRequest, UserData, UserResponse } from 'src/proto/user';
import { HistoryService } from './history/history.service';
import { jsToProtoUserType } from 'src/utils/user-type-converter';
import { PasswordService } from './password/password.service';
import { UserSettingsService } from './user-settings/user-settings.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
    private readonly userSettingsService: UserSettingsService,
    private readonly historyService: HistoryService,
  ) {}

  async create({ email, phone, password, name, surname }: AddUserRequest): Promise<User> {
    const user = this.userRepository.create({
      email,
      phone,
      name,
      surname,
      password: this.passwordService.createPassword(password),
      userSettings: this.userSettingsService.create(),
    });

    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { phone } });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { users, total };
  }

  async update(id: string, updateData: Partial<UserData>): Promise<User | null> {
    await this.userRepository.update(id, updateData);
    return await this.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result?.affected ?? 0) > 0;
  }
  public async save(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  public async findUserSettingsById(id: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRole', 'userRole')
      .leftJoinAndSelect('user.userSettings', 'settings')
      .where('user.id = :id', { id })
      .getOneOrFail();
  }

  public async findUserById(id: string): Promise<User | null> {
    return await this.userRepository.createQueryBuilder('user').where('user.id = :id', { id }).getOne();
  }

  public async findUserWithPassword(login: string, fingerprintHash?: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.password', 'password')
      .leftJoinAndSelect('user.userSettings', 'settings')
      .where('user.email = :email', { email: login })
      .getOne();

    if (user?.userSettings?.isAdaptiveAuthEnabled) {
      const history = await this.historyService.getHistory(user.id, fingerprintHash ?? '');
      if (history) {
        user.authHistories = [history];
      }
    }
    return user;
  }

  public async findUserWithPasswordById(id?: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.password', 'password')
      .leftJoinAndSelect('user.userSettings', 'settings')
      .orWhere('user.id = :id', { id })
      .getOneOrFail();
  }

  public async findUserSettings(login: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userSettings', 'settings')
      .where('user.email = :email', { email: login })
      .getOneOrFail();
  }
  public async findUser(email: string): Promise<User | null> {
    return await this.userRepository.createQueryBuilder('user').where('user.email = :email', { email }).getOne();
  }

  public async findUserByEmail(email: string): Promise<UserResponse> {
    const user = await this.userRepository.createQueryBuilder('user').where('user.email = :email', { email }).getOne();

    if (user) {
      return {
        status: true,
        message: 'User found',
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          surname: user.surname,
          suspended: user.suspended,
          type: jsToProtoUserType('user' as any),
        },
      };
    }

    return {
      status: false,
      message: 'User not found',
    };
  }
}
