import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { LoginQuery } from '../impl/login.query';
import { LoginService } from '../../login.service';
import { LoginResponse } from 'src/proto/login';

@QueryHandler(LoginQuery)
export class LoginHandler implements IQueryHandler<LoginQuery, LoginResponse> {
  constructor(
    private readonly loginService: LoginService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(LoginHandler.name);
  }

  execute(query: LoginQuery): Promise<LoginResponse> {
    this.logger.log('Executing Login');

    try {
      return this.loginService.login(query.email, query.password);
    } catch (error) {
      this.logger.error('Error executing Login', error);
      throw error;
    }
  }
}
