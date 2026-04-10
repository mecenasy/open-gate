import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommandQuery } from '../impl/get-command.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetCommandQuery)
export class GetCommandHandler implements IQueryHandler<GetCommandQuery, CommandProto | null> {
  constructor(private readonly commandService: CommandService) {}

  async execute(query: GetCommandQuery): Promise<CommandProto | null> {
    const entity = await this.commandService.findByIdentifier({ id: query.id, name: query.name });
    return entity ? this.commandService.entityToProto(entity) : null;
  }
}
