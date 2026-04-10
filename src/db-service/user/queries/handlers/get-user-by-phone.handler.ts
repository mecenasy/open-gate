import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByPhoneQuery } from '../impl/get-user-by-phone.query';
import { UserService } from '../../user.service';
import { UserData } from 'src/proto/user';

@QueryHandler(GetUserByPhoneQuery)
export class GetUserByPhoneHandler implements IQueryHandler<GetUserByPhoneQuery, UserData | null> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUserByPhoneQuery): Promise<UserData | null> {
    const entity = await this.userService.findByPhone(query.phone);
    return entity ? this.userService.entityToProto(entity) : null;
  }
}
