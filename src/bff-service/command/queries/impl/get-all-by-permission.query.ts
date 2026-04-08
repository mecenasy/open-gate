import { Query } from '@nestjs/cqrs';
import { GetAllCommandsResponse } from 'src/proto/command';
import { GetAllByPermissionType } from '../../dto/get-all-by-permission.type';

export class GetAllByPermissionQuery extends Query<GetAllCommandsResponse> {
  constructor(public readonly input: GetAllByPermissionType) {
    super();
  }
}
