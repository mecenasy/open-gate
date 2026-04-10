import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllCommandsQuery } from '../impl/get-all-commands.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetAllCommandsQuery)
export class GetAllCommandsHandler implements IQueryHandler<
  GetAllCommandsQuery,
  { data: CommandProto[]; total: number }
> {
  constructor(private readonly commandService: CommandService) {}

  async execute(query: GetAllCommandsQuery): Promise<{ data: CommandProto[]; total: number }> {
    const { commands, total } = await this.commandService.findAll(
      query.page,
      query.limit,
      query.activeOnly,
      query.actionFilter,
    );
    return { data: commands.map((c) => this.commandService.entityToProto(c)), total };
  }
}
