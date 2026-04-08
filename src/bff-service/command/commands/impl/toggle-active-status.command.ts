import { Command } from '@nestjs/cqrs';
import { CommandResponse } from 'src/proto/command';
import { ToggleActiveStatusType } from '../../dto/toggle-active-status.type';

export class ToggleActiveStatusCommand extends Command<CommandResponse> {
  constructor(public readonly input: ToggleActiveStatusType) {
    super();
  }
}
