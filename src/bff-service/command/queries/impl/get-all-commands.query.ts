import { Query } from '@nestjs/cqrs';
import { CommandAction, GetAllCommandsResponse } from 'src/proto/command';

export class GetAllCommandsQuery extends Query<GetAllCommandsResponse> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly activeOnly?: boolean,
    public readonly actionFilter?: CommandAction,
  ) {
    super();
  }
}
