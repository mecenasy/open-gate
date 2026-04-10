import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUser2FaSecretQuery } from '../impl/get-user-2fa-secret.query';
import { LoginService } from '../../login.service';
import { Verify2FAResponse } from 'src/proto/login';

@QueryHandler(GetUser2FaSecretQuery)
export class GetUser2FaSecretHandler implements IQueryHandler<GetUser2FaSecretQuery, Verify2FAResponse> {
  constructor(private readonly loginService: LoginService) {}

  execute(query: GetUser2FaSecretQuery): Promise<Verify2FAResponse> {
    return this.loginService.getUser2FaSecret(query.login);
  }
}
