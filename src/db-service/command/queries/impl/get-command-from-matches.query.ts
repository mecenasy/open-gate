import { Query } from '@nestjs/cqrs';
import { Command as CommandProto } from 'src/proto/command';

export class GetCommandFromMatchesQuery extends Query<CommandProto | null> {
  constructor(public readonly matches: string[]) {
    super();
  }
}
