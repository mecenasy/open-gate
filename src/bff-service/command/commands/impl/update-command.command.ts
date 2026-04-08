import { Command } from '@nestjs/cqrs';
import { CommandResponse } from 'src/proto/command';
import { UpdateCommandType } from '../../dto/update-command.type';

export class UpdateCommandCommand extends Command<CommandResponse> {
  constructor(public readonly input: UpdateCommandType) {
    super();
  }
}
