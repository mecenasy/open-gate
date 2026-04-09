import { Command } from '@nestjs/cqrs';
import { ConfigResponse } from 'src/proto/config';
import { UpdateConfigType } from '../../dto/update-config.type';

export class UpdateConfigCommand extends Command<ConfigResponse> {
  constructor(public readonly input: UpdateConfigType) {
    super();
  }
}
