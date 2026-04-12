import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomLogger } from '@app/logger';
import { GetLoginStatusQuery } from '../impl/get-login-status.query';
import { LoginService } from '../../login.service';
import { LoginStatusResponse } from 'src/proto/login';

@QueryHandler(GetLoginStatusQuery)
export class GetLoginStatusHandler implements IQueryHandler<GetLoginStatusQuery, LoginStatusResponse> {
  constructor(
    private readonly loginService: LoginService,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(GetLoginStatusHandler.name);
  }

  execute(query: GetLoginStatusQuery): Promise<LoginStatusResponse> {
    this.logger.log('Executing GetLoginStatus');

    try {
      return this.loginService.getLoginStatus(query.userId);
    } catch (error) {
      this.logger.error('Error executing GetLoginStatus', error);
      throw error;
    }
  }
}
