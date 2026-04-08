import { Query } from '@nestjs/cqrs';
import { CommandResponse } from 'src/proto/command';
import { GetCommandType } from '../../dto/get-command.type';

export class GetCommandQuery extends Query<CommandResponse> {
  constructor(public readonly input: GetCommandType) {
    super();
  }
}
