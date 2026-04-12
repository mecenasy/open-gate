import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetAllUsersQuery } from '../impl/get-all-users.query';
import { User } from '../../entity/user.entity';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery, { data: UserData[]; total: number }> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetAllUsersHandler.name);
  }

  async execute(query: GetAllUsersQuery): Promise<{ data: UserData[]; total: number }> {
    this.logger.log('Executing GetAllUsers');

    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const [users, total] = await this.userRepository.findAndCount({
        skip: (page - 1) * limit,
        relations: ['userRole'],
        take: limit,
      });
      return { data: users.map(entityToProto), total };
    } catch (error) {
      this.logger.error('Error executing GetAllUsers', error);
      throw error;
    }
  }
}
