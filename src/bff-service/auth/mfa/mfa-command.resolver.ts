import { CommandBus } from '@nestjs/cqrs';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { StatusType } from '../login/dto/status.type';
import { VerifyCodeCommand } from './commands/impl/verify-code.command';
import { VerifyCodeType } from './dto/verify-code.type';
import express from 'express';
import { Public } from '@app/auth';

@Resolver('VerifyMfaCode')
export class CommandVerifyMfaResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => StatusType)
  async verifyMfa(@Args('input') { code, email }: VerifyCodeType, @Context() ctx: express.Response) {
    return this.commandBus.execute<VerifyCodeCommand, StatusType>(new VerifyCodeCommand(email, code, ctx.req.session));
  }
}
