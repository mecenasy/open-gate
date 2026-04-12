import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckExistQuery } from '../impl/check-exist.query';
import { User } from '../../entity/user.entity';

@QueryHandler(CheckExistQuery)
export class CheckExistHandler implements IQueryHandler<CheckExistQuery, boolean> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(CheckExistHandler.name);
  }

  async execute(query: CheckExistQuery): Promise<boolean> {
    this.logger.log('Executing CheckExist');

    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email: query.email })
        .getOne();
      return !!user;
    } catch (error) {
      this.logger.error('Error executing CheckExist', error);
      throw error;
    }
  }
}
