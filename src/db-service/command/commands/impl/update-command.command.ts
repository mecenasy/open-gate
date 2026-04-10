import { Command } from '@nestjs/cqrs';
import { Command as CommandProto, UpdateCommandRequest } from 'src/proto/command';

export class UpdateCommandCommand extends Command<CommandProto | null> {
  constructor(
    public readonly id: string,
    public readonly request: UpdateCommandRequest,
  ) {
    super();
  }
}
