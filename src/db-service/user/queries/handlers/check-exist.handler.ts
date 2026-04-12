import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckExistQuery } from '../impl/check-exist.query';
import { User } from '../../entity/user.entity';

@QueryHandler(CheckExistQuery)
export class CheckExistHandler implements IQueryHandler<CheckExistQuery, boolean> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: CheckExistQuery): Promise<boolean> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: query.email })
      .getOne();
    return !!user;
  }
}
