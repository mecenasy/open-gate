import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { CheckExistQuery } from '../impl/check-exist.query';
import { User } from '../../entity/user.entity';

@QueryHandler(CheckExistQuery)
export class CheckExistHandler extends BaseQueryHandler<CheckExistQuery, boolean> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: CheckExistQuery): Promise<boolean> {
    return this.run('CheckExist', async () => {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email: query.email })
        .getOne();
      return !!user;
    });
  }
}
