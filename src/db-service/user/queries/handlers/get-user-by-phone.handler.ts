import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserByPhoneQuery } from '../impl/get-user-by-phone.query';
import { User } from '../../entity/user.entity';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@QueryHandler(GetUserByPhoneQuery)
export class GetUserByPhoneHandler implements IQueryHandler<GetUserByPhoneQuery, UserData | null> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetUserByPhoneHandler.name);
  }

  async execute(query: GetUserByPhoneQuery): Promise<UserData | null> {
    this.logger.log('Executing GetUserByPhone');

    try {
      const entity = await this.userRepository.findOneOrFail({
        relations: ['userRole'],
        where: { phone: query.phone },
      });
      return entity ? entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing GetUserByPhone', error);
      throw error;
    }
  }
}
