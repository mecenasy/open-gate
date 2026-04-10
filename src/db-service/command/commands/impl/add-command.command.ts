import { Command } from '@nestjs/cqrs';
import { AddCommandRequest, Command as CommandProto } from 'src/proto/command';

export class AddCommandCommand extends Command<CommandProto> {
  constructor(public readonly request: AddCommandRequest) {
    super();
  }
}
