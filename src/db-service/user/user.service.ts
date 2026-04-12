import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { HistoryService } from './history/history.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly historyService: HistoryService,
  ) {}

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
}
