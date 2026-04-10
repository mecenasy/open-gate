import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLoginStatusQuery } from '../impl/get-login-status.query';
import { LoginService } from '../../login.service';
import { LoginStatusResponse } from 'src/proto/login';

@QueryHandler(GetLoginStatusQuery)
export class GetLoginStatusHandler implements IQueryHandler<GetLoginStatusQuery, LoginStatusResponse> {
  constructor(private readonly loginService: LoginService) {}

  execute(query: GetLoginStatusQuery): Promise<LoginStatusResponse> {
    return this.loginService.getLoginStatus(query.userId);
  }
}
