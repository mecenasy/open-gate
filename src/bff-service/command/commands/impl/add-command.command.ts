import { Command } from '@nestjs/cqrs';
import { CommandResponse } from 'src/proto/command';
import { AddCommandType } from '../../dto/add-command.type';

export class AddCommandCommand extends Command<CommandResponse> {
  constructor(public readonly input: AddCommandType) {
    super();
  }
}
