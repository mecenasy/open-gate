import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetUserQuery } from '../impl/get-user.query';
import { User } from '../../entity/user.entity';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@QueryHandler(GetUserQuery)
export class GetUserHandler extends BaseQueryHandler<GetUserQuery, UserData | null> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetUserQuery): Promise<UserData | null> {
    return this.run('GetUser', async () => {
      const entity = await this.userRepository.findOne({
        where: { id: query.id },
        relations: ['userRole'],
      });
      return entity ? entityToProto(entity) : null;
    });
  }
}
