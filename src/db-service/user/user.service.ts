import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { AddUserRequest, Status, UserData, UserResponse, UserType as ProtoUserType } from 'src/proto/user';
import { HistoryService } from './history/history.service';
import { jsToProtoUserType, protoToJsUserType } from 'src/utils/user-type-converter';
import { PasswordService } from './password/password.service';
import { UserSettingsService } from './user-settings/user-settings.service';
import { UserRole } from './entity/user-role.entity';
import { UserType } from './user-type';
import { UserStatus } from './status';
import { protoToUserStatus, userStatusToProto } from 'src/utils/concert-status';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly passwordService: PasswordService,
    private readonly userSettingsService: UserSettingsService,
    private readonly historyService: HistoryService,
  ) {}

  async create({ email, phone, password, name, surname, type, ownerId }: AddUserRequest): Promise<User> {
    const userType = await this.userRoleRepository.findOneOrFail({
      where: {
        userType: type ? protoToJsUserType(type) : UserType.User,
      },
    });

    const user = this.userRepository.create({
      email,
      phone,
      name,
      surname,
      status: UserStatus.Pending,
      userRole: userType,
      userSettings: this.userSettingsService.create(),
    });

    if (ownerId) {
      user.ownerId = ownerId;
    }
    if (password) {
      user.password = this.passwordService.createPassword(password);
    }

    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['userRole'],
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({
      relations: ['userRole'],
      where: { phone },
    });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      relations: ['userRole'],
      take: limit,
    });
    return { users, total };
  }

  async update(id: string, { type, status, ...updateData }: Partial<UserData>): Promise<User | null> {
    const dataToUpdate: Partial<User> = { ...updateData };
    if (type) {
      const userType = await this.userRoleRepository.findOneOrFail({
        where: {
          userType: type ? protoToJsUserType(type) : UserType.User,
        },
      });

      dataToUpdate.userRole = userType;
    }
    if (status) {
      dataToUpdate.status = protoToUserStatus(status);
    }
    await this.userRepository.update(id, dataToUpdate);
    return await this.findById(id);
  }

  async updateStatus(id: string, status: Status): Promise<User | null> {
    await this.userRepository.update(id, { status: protoToUserStatus(status) });
    return await this.findById(id);
  }

  async updateRole(id: string, type: ProtoUserType): Promise<User | null> {
    const userRole = await this.userRoleRepository.findOneOrFail({
      where: {
        userType: protoToJsUserType(type),
      },
    });

    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    user.userRole = userRole;
    await this.userRepository.save(user);
    return await this.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.userRepository.delete({
      id,
      ownerId: id,
    });
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
      .leftJoinAndSelect('user.userRole', 'userRole')
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
          status: userStatusToProto(user.status),
          type: jsToProtoUserType(user.userRole.userType),
        },
      };
    }

    return {
      status: false,
      message: 'User not found',
    };
  }
}
