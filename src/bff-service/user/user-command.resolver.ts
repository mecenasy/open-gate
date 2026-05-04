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
import { RegisterCommand } from './commands/impl/register.command';
import { ConfirmRegistrationCommand } from './commands/impl/confirm-registration.command';
import { CurrentUserId, Public } from '@app/auth';
import { CreateSimpleUserType } from './dto/create-simple-user.type.';
import { CreateSimpleUserCommand } from './commands/impl/create-simple-user.command';
import { RegisterInput } from './dto/register.input';
import { ActivatePendingUserCommand } from './commands/impl/activate-pending-user.command';
import { UnauthorizedException } from '@nestjs/common';

@Resolver()
export class UserCommandResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Mutation(() => SuccessResponseType)
  async register(@Args('input') input: RegisterInput): Promise<SuccessResponseType> {
    await this.commandBus.execute<RegisterCommand, void>(new RegisterCommand(input));
    return { success: true };
  }

  @Public()
  @Mutation(() => SuccessResponseType)
  async confirmRegistration(@Args('token') token: string): Promise<SuccessResponseType> {
    return this.commandBus.execute<ConfirmRegistrationCommand, SuccessResponseType>(
      new ConfirmRegistrationCommand(token),
    );
  }

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

  /**
   * Manual activation gate for users created via contact binding (and any
   * other path that lands status='pending'). Logged-in only — any account
   * holding a session has either a password or PassKey, which by current
   * design means a tenant_staff user with web-system access; that's the
   * gate the user spec asked for. Self-activation is rejected at the
   * handler level (no scripted self-promote).
   */
  @Mutation(() => UserSummaryType)
  async activatePendingUser(
    @Args('userId') userId: string,
    @CurrentUserId() callerUserId?: string,
  ): Promise<UserSummaryType> {
    if (!callerUserId) throw new UnauthorizedException();
    return this.commandBus.execute<ActivatePendingUserCommand, UserSummaryType>(
      new ActivatePendingUserCommand(userId, callerUserId),
    );
  }
}
