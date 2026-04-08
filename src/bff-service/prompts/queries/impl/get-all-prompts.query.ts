import { Query } from '@nestjs/cqrs';
import { GetAllPromptsResponse } from 'src/proto/prompt';
import { UserType } from '../../dto/enums';

export class GetAllPromptsQuery extends Query<GetAllPromptsResponse> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly userType?: UserType,
  ) {
    super();
  }
}
