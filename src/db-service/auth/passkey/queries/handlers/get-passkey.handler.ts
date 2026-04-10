import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPasskeyQuery } from '../impl/get-passkey.query';
import { PasskeyService } from '../../passkey.service';
import { GetPasskeyResponse } from 'src/proto/passkey';

@QueryHandler(GetPasskeyQuery)
export class GetPasskeyHandler implements IQueryHandler<GetPasskeyQuery, GetPasskeyResponse> {
  constructor(private readonly passkeyService: PasskeyService) {}

  execute(query: GetPasskeyQuery): Promise<GetPasskeyResponse> {
    return this.passkeyService.getPasskey(query.request);
  }
}
