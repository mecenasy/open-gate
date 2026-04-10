import { Query } from '@nestjs/cqrs';
import { Command as CommandProto } from 'src/proto/command';

export class GetCommandQuery extends Query<CommandProto | null> {
  constructor(
    public readonly id?: string,
    public readonly name?: string,
  ) {
    super();
  }
}
