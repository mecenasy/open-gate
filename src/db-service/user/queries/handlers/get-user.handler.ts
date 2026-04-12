import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
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
  ) {}

  async execute(query: GetUserQuery): Promise<UserData | null> {
    const entity = await this.userRepository.findOne({
      where: { id: query.id },
      relations: ['userRole'],
    });
    return entity ? entityToProto(entity) : null;
  }
}
