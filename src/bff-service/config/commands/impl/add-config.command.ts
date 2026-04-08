import { Command } from '@nestjs/cqrs';
import { ConfigResponse } from 'src/proto/config';
import { AddConfigType } from '../../dto/add-config.type';

export class AddConfigCommand extends Command<ConfigResponse> {
  constructor(public readonly input: AddConfigType) {
    super();
  }
}
