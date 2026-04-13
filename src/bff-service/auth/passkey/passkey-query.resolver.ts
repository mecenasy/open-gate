import { CommandBus } from '@nestjs/cqrs';
import { Query, Resolver } from '@nestjs/graphql';
import { GetPasskeysQuery } from './queries/impl/get-keys.query';
import { PassKeyType } from './dto/passkey-list-type';
import { CurrentUserId } from '@app/auth';

@Resolver('Passkey')
export class PasskeyQueriesResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Query(() => [PassKeyType])
  async getPasskeys(@CurrentUserId() userId: string) {
    return this.commandBus.execute<GetPasskeysQuery, PassKeyType[]>(new GetPasskeysQuery(userId));
  }
}
