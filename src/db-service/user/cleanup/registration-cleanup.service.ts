import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { User } from '../entity/user.entity';
import { UserStatus } from '../status';
import { UserType } from '../user-type';

@Injectable()
export class RegistrationCleanupService {
  private readonly logger = new Logger(RegistrationCleanupService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron('*/5 * * * *')
  async removeUnconfirmedOwners(): Promise<void> {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000);

    const stale = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.userRole', 'role')
      .where('user.status = :status', { status: UserStatus.Pending })
      .andWhere('role.userType = :type', { type: UserType.Owner })
      .andWhere('user.created_at < :cutoff', { cutoff })
      .getMany();

    if (stale.length > 0) {
      await this.userRepository.remove(stale);
      this.logger.log(`Removed ${stale.length} unconfirmed owner account(s)`);
    }
  }
}
