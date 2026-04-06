import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CommandBus } from '@nestjs/cqrs';
import { LoginType } from './dto/login-type';
import { LoginCommand } from './commands/impl/login.command';
import { StatusType } from './dto/status.type';
import { LogoutCommand } from './commands/impl/logout.command';
import { Context } from '@nestjs/graphql';
import express from 'express';
import { ChangePasswordType } from './dto/change-password.tape';
import { ChangePasswordCommand } from './commands/impl/change-password.command';
import { ResetPasswordType } from './dto/reset-password.tape';
import { ResetPasswordCommand } from './commands/impl/reset-password.command';
import { ForgotPasswordCommand } from './commands/impl/forgot-password.command';
import { ForgotPasswordType } from './dto/forgot-password.tape';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  type Security,
  SecurityContextInterceptor,
} from 'src/bff-service/common/interceptors/security-context.interceptor';
import { Public } from 'src/bff-service/common/decorators/public.decorator';
import { SecurityContext } from 'src/bff-service/common/decorators/security-context.decorator';
import { CurrentUserId } from 'src/bff-service/common/decorators/current-user-id.decorator';

@Resolver('Login')
@UseInterceptors(SecurityContextInterceptor)
export class LoginCommandsResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Mutation(() => StatusType)
  async loginUser(@Args('input') input: LoginType, @SecurityContext() security: Security) {
    return this.commandBus.execute<LoginCommand, StatusType>(new LoginCommand(input.email, input.password, security));
  }

  @Public()
  @Mutation(() => StatusType)
  async logoutUser(@CurrentUserId() userId: string, @Context() ctx: express.Response) {
    return this.commandBus.execute<LogoutCommand, StatusType>(new LogoutCommand(userId, ctx.req.session));
  }

  @Mutation(() => StatusType)
  async changePassword(@CurrentUserId() userId: string, @Args('input') input: ChangePasswordType) {
    return this.commandBus.execute<ChangePasswordCommand, StatusType>(
      new ChangePasswordCommand(userId, input.oldPassword, input.newPassword),
    );
  }

  @Public()
  @Mutation(() => StatusType)
  async resetPassword(@Args('input') input: ResetPasswordType) {
    return this.commandBus.execute<ResetPasswordCommand, StatusType>(
      new ResetPasswordCommand(input.token, input.password),
    );
  }
  @Public()
  @Mutation(() => StatusType)
  async forgotPassword(@Args('input') input: ForgotPasswordType) {
    return this.commandBus.execute<ForgotPasswordCommand, StatusType>(new ForgotPasswordCommand(input.email));
  }
}
