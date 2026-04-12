import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserByEmailQuery } from '../impl/get-user-by-email.query';
import { User } from '../../entity/user.entity';
import { userStatusToProto } from 'src/utils/concert-status';
import { jsToProtoUserType } from 'src/utils/user-type-converter';
import { UserResponse } from 'src/proto/user';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery, UserResponse> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: GetUserByEmailQuery): Promise<UserResponse> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRole', 'userRole')
      .where('user.email = :email', { email: query.email })
      .getOne();

    if (user) {
      return {
        status: true,
        message: 'User found',
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          surname: user.surname,
          status: userStatusToProto(user.status),
          type: jsToProtoUserType(user.userRole.userType),
        },
      };
    }

    return {
      status: false,
      message: 'User not found',
    };
  }
}
