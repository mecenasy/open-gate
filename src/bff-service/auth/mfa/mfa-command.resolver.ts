import { CommandBus } from '@nestjs/cqrs';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { StatusType } from '../login/dto/status.type';
import { VerifyCodeCommand } from './commands/impl/verify-code.command';
import { VerifyCodeType } from './dto/verify-code.type';
import express from 'express';
import { Public } from 'src/bff-service/common/decorators/public.decorator';

@Resolver('VerifyMfaCode')
export class CommandVerifyMfaResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Mutation(() => StatusType)
  async verifyMfa(@Args('input') { code, email }: VerifyCodeType, @Context() ctx: express.Response) {
    return this.commandBus.execute<VerifyCodeCommand, StatusType>(new VerifyCodeCommand(email, code, ctx.req.session));
  }
}
