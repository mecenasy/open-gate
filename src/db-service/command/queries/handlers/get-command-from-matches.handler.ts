import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommandFromMatchesQuery } from '../impl/get-command-from-matches.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetCommandFromMatchesQuery)
export class GetCommandFromMatchesHandler implements IQueryHandler<GetCommandFromMatchesQuery, CommandProto | null> {
  constructor(private readonly commandService: CommandService) {}

  async execute(query: GetCommandFromMatchesQuery): Promise<CommandProto | null> {
    const entity = await this.commandService.findByMatches(query.matches);
    return entity ? this.commandService.entityToProto(entity) : null;
  }
}
