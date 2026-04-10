import { Query } from '@nestjs/cqrs';
import { Command as CommandProto } from 'src/proto/command';

export class GetAllCommandsQuery extends Query<{ data: CommandProto[]; total: number }> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly activeOnly: boolean = false,
    public readonly actionFilter?: Record<string, boolean>,
  ) {
    super();
  }
}
