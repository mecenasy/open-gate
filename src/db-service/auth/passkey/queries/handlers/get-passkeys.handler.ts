import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPasskeysQuery } from '../impl/get-passkeys.query';
import { PasskeyService } from '../../passkey.service';
import { GetPasskeysResponse } from 'src/proto/passkey';

@QueryHandler(GetPasskeysQuery)
export class GetPasskeysHandler implements IQueryHandler<GetPasskeysQuery, GetPasskeysResponse> {
  constructor(private readonly passkeyService: PasskeyService) {}

  execute(query: GetPasskeysQuery): Promise<GetPasskeysResponse> {
    return this.passkeyService.getPasskeys(query.request);
  }
}
