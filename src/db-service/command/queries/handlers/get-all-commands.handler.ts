import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetAllCommandsQuery } from '../impl/get-all-commands.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetAllCommandsQuery)
export class GetAllCommandsHandler extends BaseQueryHandler<
  GetAllCommandsQuery,
  { data: CommandProto[]; total: number }
> {
  constructor(
    private readonly commandService: CommandService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetAllCommandsQuery): Promise<{ data: CommandProto[]; total: number }> {
    return this.run('GetAllCommands', async () => {
      const { commands, total } = await this.commandService.findAll(
        query.page,
        query.limit,
        query.activeOnly,
        query.actionFilter,
      );
      return { data: commands.map((c) => this.commandService.entityToProto(c)), total };
    });
  }
}
