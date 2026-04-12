import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetUser2FaSecretQuery } from '../impl/get-user-2fa-secret.query';
import { LoginService } from '../../login.service';
import { Verify2FAResponse } from 'src/proto/login';

@QueryHandler(GetUser2FaSecretQuery)
export class GetUser2FaSecretHandler implements IQueryHandler<GetUser2FaSecretQuery, Verify2FAResponse> {
  constructor(
    private readonly loginService: LoginService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetUser2FaSecretHandler.name);
  }

  execute(query: GetUser2FaSecretQuery): Promise<Verify2FAResponse> {
    this.logger.log('Executing GetUser2FaSecret');

    try {
      return this.loginService.getUser2FaSecret(query.login);
    } catch (error) {
      this.logger.error('Error executing GetUser2FaSecret', error);
      throw error;
    }
  }
}
