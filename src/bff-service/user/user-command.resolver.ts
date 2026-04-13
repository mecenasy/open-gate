import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { UserType } from './dto/user.type.';
import { CreateUserType } from './dto/create-user.type.';
import { UpdateUserType } from './dto/update-user.type';
import { UpdateUserStatusType } from './dto/update-user-status.type';
import { UpdateUserRoleType } from './dto/update-user-role.type';
import { GetUserType } from './dto/get-user.type';
import { SuccessResponseType, UserSummaryType } from './dto/response.type';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { UpdateUserCommand } from './commands/impl/update-user.command';
import { UpdateUserStatusCommand } from './commands/impl/update-user-status.command';
import { UpdateUserRoleCommand } from './commands/impl/update-user-role.command';
import { RemoveUserCommand } from './commands/impl/remove-user.command';
import { Public } from '@app/auth';
import { CreateSimpleUserType } from './dto/create-simple-user.type.';
import { CreateSimpleUserCommand } from './commands/impl/create-simple-user.command';

@Resolver()
export class UserCommandResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Mutation(() => UserType)
  async createUser(@Args('input') input: CreateUserType) {
    return this.commandBus.execute<CreateUserCommand, UserType>(new CreateUserCommand(input));
  }

  @Mutation(() => UserType)
  async createSimpleUser(@Args('input') input: CreateSimpleUserType) {
    return this.commandBus.execute<CreateSimpleUserCommand, UserType>(new CreateSimpleUserCommand(input));
  }

  @Mutation(() => UserSummaryType)
  async updateUser(@Args('input') input: UpdateUserType) {
    return this.commandBus.execute<UpdateUserCommand, UserSummaryType>(new UpdateUserCommand(input));
  }

  @Mutation(() => UserSummaryType)
  async updateUserStatus(@Args('input') input: UpdateUserStatusType) {
    return this.commandBus.execute<UpdateUserStatusCommand, UserSummaryType>(new UpdateUserStatusCommand(input));
  }

  @Mutation(() => UserSummaryType)
  async updateUserRole(@Args('input') input: UpdateUserRoleType) {
    return this.commandBus.execute<UpdateUserRoleCommand, UserSummaryType>(new UpdateUserRoleCommand(input));
  }

  @Mutation(() => SuccessResponseType)
  async removeUser(@Args('input') input: GetUserType) {
    return this.commandBus.execute<RemoveUserCommand, SuccessResponseType>(new RemoveUserCommand(input.id));
  }
}
