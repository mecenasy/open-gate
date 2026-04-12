import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetPasskeysQuery } from '../impl/get-passkeys.query';
import { PasskeyService } from '../../passkey.service';
import { GetPasskeysResponse } from 'src/proto/passkey';

@QueryHandler(GetPasskeysQuery)
export class GetPasskeysHandler implements IQueryHandler<GetPasskeysQuery, GetPasskeysResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetPasskeysHandler.name);
  }

  execute(query: GetPasskeysQuery): Promise<GetPasskeysResponse> {
    this.logger.log('Executing GetPasskeys');

    try {
      return this.passkeyService.getPasskeys(query.request);
    } catch (error) {
      this.logger.error('Error executing GetPasskeys', error);
      throw error;
    }
  }
}
