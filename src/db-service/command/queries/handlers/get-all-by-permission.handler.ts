import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllByPermissionQuery } from '../impl/get-all-by-permission.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetAllByPermissionQuery)
export class GetAllByPermissionHandler implements IQueryHandler<
  GetAllByPermissionQuery,
  { data: CommandProto[]; total: number }
> {
  constructor(private readonly commandService: CommandService) {}

  async execute(query: GetAllByPermissionQuery): Promise<{ data: CommandProto[]; total: number }> {
    const { commands, total } = await this.commandService.findAllByPermission(
      query.roleName,
      query.page,
      query.limit,
      query.activeOnly,
    );
    return { data: commands.map((c) => this.commandService.entityToProto(c)), total };
  }
}
