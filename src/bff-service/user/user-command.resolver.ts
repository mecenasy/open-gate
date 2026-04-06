import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { UserType } from './dto/user.type.';
import { CreateUserType } from './dto/create-user.type.';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { Public } from '../common/decorators/public.decorator';

@Resolver()
export class UserCommandResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Mutation(() => UserType)
  async createUser(@Args('input') input: CreateUserType) {
    return this.commandBus.execute<CreateUserCommand, UserType>(new CreateUserCommand(input));
  }
}
