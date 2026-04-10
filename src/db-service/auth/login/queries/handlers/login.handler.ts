import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoginQuery } from '../impl/login.query';
import { LoginService } from '../../login.service';
import { LoginResponse } from 'src/proto/login';

@QueryHandler(LoginQuery)
export class LoginHandler implements IQueryHandler<LoginQuery, LoginResponse> {
  constructor(private readonly loginService: LoginService) {}

  execute(query: LoginQuery): Promise<LoginResponse> {
    return this.loginService.login(query.email, query.password);
  }
}
