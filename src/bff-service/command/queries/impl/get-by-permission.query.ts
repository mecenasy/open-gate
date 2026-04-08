import { Query } from '@nestjs/cqrs';
import { CommandResponse } from 'src/proto/command';
import { GetByPermissionType } from '../../dto/get-by-permission.type';

export class GetByPermissionQuery extends Query<CommandResponse> {
  constructor(public readonly input: GetByPermissionType) {
    super();
  }
}
