import { Query } from '@nestjs/cqrs';
import { Command as CommandProto } from 'src/proto/command';

export class GetByPermissionQuery extends Query<CommandProto | null> {
  constructor(
    public readonly roleName: string,
    public readonly id?: string,
    public readonly name?: string,
  ) {
    super();
  }
}
