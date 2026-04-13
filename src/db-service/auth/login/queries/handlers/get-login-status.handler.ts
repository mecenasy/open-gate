import { QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { BaseQueryHandler } from '@app/cqrs';
import { GetLoginStatusQuery } from '../impl/get-login-status.query';
import { LoginService } from '../../login.service';
import { LoginStatusResponse } from 'src/proto/login';

@QueryHandler(GetLoginStatusQuery)
export class GetLoginStatusHandler extends BaseQueryHandler<GetLoginStatusQuery, LoginStatusResponse> {
  constructor(
    private readonly loginService: LoginService,
    logger: CustomLogger,
  ) {
    super(logger);
  }

  execute(query: GetLoginStatusQuery): Promise<LoginStatusResponse> {
    return this.run('GetLoginStatus', () => this.loginService.getLoginStatus(query.userId));
  }
}
