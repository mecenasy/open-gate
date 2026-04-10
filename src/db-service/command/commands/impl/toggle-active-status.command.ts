import { Command } from '@nestjs/cqrs';
import { Command as CommandProto } from 'src/proto/command';

export class ToggleActiveStatusCommand extends Command<CommandProto | null> {
  constructor(
    public readonly id: string,
    public readonly active: boolean,
  ) {
    super();
  }
}
