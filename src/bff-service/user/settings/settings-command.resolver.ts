import { CommandBus } from '@nestjs/cqrs';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Reject2FaCommand } from './commands/impl/reject-2fa.command';
import { Accept2faCommand } from './commands/impl/accept-2fa.command';
import { AcceptType } from './dto/accept-2fa.type';
import { Verify2faCommand } from './commands/impl/verify-2fa.command';
import { AcceptAdaptiveLoginCommand } from './commands/impl/accept-adaptive-login.command';
import { AcceptAdaptiveLoginType } from './dto/accept-adaptive-login.type';
import { CurrentUserId } from 'src/bff-service/common/decorators/current-user-id.decorator';
import { StatusType } from 'src/bff-service/auth/login/dto/status.type';

@Resolver('Settings')
export class SettingsCommandResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Mutation(() => AcceptType)
  async accept2fa(@CurrentUserId() id: string) {
    return this.commandBus.execute<Accept2faCommand, AcceptType>(new Accept2faCommand(id));
  }

  @Mutation(() => StatusType)
  async reject2fa(@CurrentUserId() id: string) {
    return await this.commandBus.execute<Reject2FaCommand, StatusType>(new Reject2FaCommand(id));
  }

  @Mutation(() => AcceptAdaptiveLoginType)
  async adaptiveLogin(@CurrentUserId() id: string) {
    return await this.commandBus.execute<AcceptAdaptiveLoginCommand, AcceptAdaptiveLoginType>(
      new AcceptAdaptiveLoginCommand(id),
    );
  }

  @Mutation(() => StatusType)
  async verify2fa(@Args('code') code: string, @CurrentUserId() id: string) {
    return await this.commandBus.execute<Verify2faCommand, StatusType>(new Verify2faCommand(id, code));
  }
}
