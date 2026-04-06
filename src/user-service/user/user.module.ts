import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QueryUsersResolver } from './query-user.resolver';
import { userQueries } from './queries/handlers';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [...userQueries, QueryUsersResolver],
})
export class UserModule {}
