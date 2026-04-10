import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetByPermissionQuery } from '../impl/get-by-permission.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetByPermissionQuery)
export class GetByPermissionHandler implements IQueryHandler<GetByPermissionQuery, CommandProto | null> {
  constructor(private readonly commandService: CommandService) {}

  async execute(query: GetByPermissionQuery): Promise<CommandProto | null> {
    const entity = await this.commandService.findByPermission(query.roleName, { id: query.id, name: query.name });
    return entity ? this.commandService.entityToProto(entity) : null;
  }
}
