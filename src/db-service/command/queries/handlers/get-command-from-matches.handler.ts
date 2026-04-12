import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetCommandFromMatchesQuery } from '../impl/get-command-from-matches.query';
import { CommandService } from '../../command.service';
import { Command as CommandProto } from 'src/proto/command';

@QueryHandler(GetCommandFromMatchesQuery)
export class GetCommandFromMatchesHandler implements IQueryHandler<GetCommandFromMatchesQuery, CommandProto | null> {
  constructor(
    private readonly commandService: CommandService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetCommandFromMatchesHandler.name);
  }

  async execute(query: GetCommandFromMatchesQuery): Promise<CommandProto | null> {
    this.logger.log('Executing GetCommandFromMatches');

    try {
      const entity = await this.commandService.findByMatches(query.matches);
      return entity ? this.commandService.entityToProto(entity) : null;
    } catch (error) {
      this.logger.error('Error executing GetCommandFromMatches', error);
      throw error;
    }
  }
}
