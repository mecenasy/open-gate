import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetByPermissionQuery } from '../impl/get-by-permission.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetByPermissionQuery)
export class GetByPermissionHandler implements IQueryHandler<GetByPermissionQuery, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetByPermissionHandler.name);
  }

  async execute(query: GetByPermissionQuery): Promise<CommandProto | null> {
    this.logger.log('Executing GetByPermission');

    try {
      const entity = await this.commandService.findByPermission(query.roleName, { id: query.id, name: query.name });
      return entity ? this.commandService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing GetByPermission', error);
      throw error;
    }
  }
}
