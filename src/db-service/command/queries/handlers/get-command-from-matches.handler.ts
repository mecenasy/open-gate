import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetCommandFromMatchesQuery } from '../impl/get-command-from-matches.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetCommandFromMatchesQuery)
export class GetCommandFromMatchesHandler extends BaseQueryHandler<GetCommandFromMatchesQuery, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetCommandFromMatchesQuery): Promise<CommandProto | null> {
    return this.run('GetCommandFromMatches', async () => {
      const entity = await this.commandService.findByMatches(query.matches);
      return entity ? this.commandService.entityToProto(entity) : null;
    });
  }
}
