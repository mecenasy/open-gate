import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetUserByPhoneQuery } from '../impl/get-user-by-phone.query';
import { User } from '../../entity/user.entity';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@QueryHandler(GetUserByPhoneQuery)
export class GetUserByPhoneHandler extends BaseQueryHandler<GetUserByPhoneQuery, UserData | null> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetUserByPhoneQuery): Promise<UserData | null> {
    return this.run('GetUserByPhone', async () => {
      const entity = await this.userRepository.findOneOrFail({
        relations: ['userRole'],
        where: { phone: query.phone },
      });
      return entity ? entityToProto(entity) : null;
    });
  }
}
