import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetAllUsersQuery } from '../impl/get-all-users.query';
import { User } from '../../entity/user.entity';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler extends BaseQueryHandler<GetAllUsersQuery, { data: UserData[]; total: number }> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetAllUsersQuery): Promise<{ data: UserData[]; total: number }> {
    return this.run('GetAllUsers', async () => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const [users, total] = await this.userRepository.findAndCount({
        skip: (page - 1) * limit,
        relations: ['userRole'],
        take: limit,
      });
      return { data: users.map(entityToProto), total };
    });
  }
}
