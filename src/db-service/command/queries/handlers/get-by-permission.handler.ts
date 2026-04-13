import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetByPermissionQuery } from '../impl/get-by-permission.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetByPermissionQuery)
export class GetByPermissionHandler extends BaseQueryHandler<GetByPermissionQuery, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetByPermissionQuery): Promise<CommandProto | null> {
    return this.run('GetByPermission', async () => {
      const entity = await this.commandService.findByPermission(query.roleName, { id: query.id, name: query.name });
      return entity ? this.commandService.entityToProto(entity) : null;
    });
  }
}
