import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserQuery } from '../impl/get-user.query';
import { User } from '../../entity/user.entity';
import { entityToProto } from '../../utils/entity-to-proto';
import { UserData } from 'src/proto/user';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, UserData | null> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetUserHandler.name);
  }

  async execute(query: GetUserQuery): Promise<UserData | null> {
    this.logger.log('Executing GetUser');

    try {
      const entity = await this.userRepository.findOne({
        where: { id: query.id },
        relations: ['userRole'],
      });
      return entity ? entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing GetUser', error);
      throw error;
    }
  }
}
