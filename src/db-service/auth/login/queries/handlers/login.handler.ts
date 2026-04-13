import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { LoginQuery } from '../impl/login.query';
import { LoginService } from '../../login.service';
import { LoginResponse } from 'src/proto/login';

@QueryHandler(LoginQuery)
export class LoginHandler extends BaseQueryHandler<LoginQuery, LoginResponse> {
  constructor(
    private readonly loginService: LoginService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: LoginQuery): Promise<LoginResponse> {
    return this.run('Login', () => this.loginService.login(query.email, query.password));
  }
}
