import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetPasskeyQuery } from '../impl/get-passkey.query';
import { PasskeyService } from '../../passkey.service';
import { GetPasskeyResponse } from 'src/proto/passkey';

@QueryHandler(GetPasskeyQuery)
export class GetPasskeyHandler implements IQueryHandler<GetPasskeyQuery, GetPasskeyResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetPasskeyHandler.name);
  }

  execute(query: GetPasskeyQuery): Promise<GetPasskeyResponse> {
    this.logger.log('Executing GetPasskey');

    try {
      return this.passkeyService.getPasskey(query.request);
    } catch (error) {
      this.logger.error('Error executing GetPasskey', error);
      throw error;
    }
  }
}
