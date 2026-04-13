import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetUser2FaSecretQuery } from '../impl/get-user-2fa-secret.query';
import { LoginService } from '../../login.service';
import { Verify2FAResponse } from 'src/proto/login';

@QueryHandler(GetUser2FaSecretQuery)
export class GetUser2FaSecretHandler extends BaseQueryHandler<GetUser2FaSecretQuery, Verify2FAResponse> {
  constructor(
    private readonly loginService: LoginService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetUser2FaSecretQuery): Promise<Verify2FAResponse> {
    return this.run('GetUser2FaSecret', () => this.loginService.getUser2FaSecret(query.login));
  }
}
