import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetPasskeysQuery } from '../impl/get-passkeys.query';
import { PasskeyService } from '../../passkey.service';
import { GetPasskeysResponse } from 'src/proto/passkey';

@QueryHandler(GetPasskeysQuery)
export class GetPasskeysHandler extends BaseQueryHandler<GetPasskeysQuery, GetPasskeysResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetPasskeysQuery): Promise<GetPasskeysResponse> {
    return this.run('GetPasskeys', () => this.passkeyService.getPasskeys(query.request));
  }
}
