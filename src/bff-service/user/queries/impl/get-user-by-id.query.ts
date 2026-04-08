import { Query } from '@nestjs/cqrs';
import { UserSummaryType } from '../../dto/response.type';

export class GetUserByIdQuery extends Query<UserSummaryType> {
  constructor(public readonly id: string) {
    super();
  }
}
