import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetAllByPermissionQuery } from '../impl/get-all-by-permission.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetAllByPermissionQuery)
export class GetAllByPermissionHandler extends BaseQueryHandler<
  GetAllByPermissionQuery,
  { data: CommandProto[]; total: number }
> {
  constructor(
    private readonly commandService: CommandService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetAllByPermissionQuery): Promise<{ data: CommandProto[]; total: number }> {
    return this.run('GetAllByPermission', async () => {
      const { commands, total } = await this.commandService.findAllByPermission(
        query.roleName,
        query.page,
        query.limit,
        query.activeOnly,
      );
      return { data: commands.map((c) => this.commandService.entityToProto(c)), total };
    });
  }
}
