import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetPasskeyQuery } from '../impl/get-passkey.query';
import { PasskeyService } from '../../passkey.service';
import { GetPasskeyResponse } from 'src/proto/passkey';

@QueryHandler(GetPasskeyQuery)
export class GetPasskeyHandler extends BaseQueryHandler<GetPasskeyQuery, GetPasskeyResponse> {
  constructor(
    private readonly passkeyService: PasskeyService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetPasskeyQuery): Promise<GetPasskeyResponse> {
    return this.run('GetPasskey', () => this.passkeyService.getPasskey(query.request));
  }
}
