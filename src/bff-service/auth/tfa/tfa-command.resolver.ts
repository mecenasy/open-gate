import { CommandBus } from '@nestjs/cqrs';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { StatusType } from '../login/dto/status.type';
import express from 'express';
import { Verify2faCodeCommand } from './commands/impl/verify-2fa-code.command';
import { Verify2faCodeType } from './dto/verify-2fa-code.type';
import { Public } from '@app/auth';

@Resolver('Verify2faCode')
export class Verify2faCodeResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Mutation(() => StatusType)
  async verify2faCode(@Args('input') { code, email }: Verify2faCodeType, @Context() ctx: express.Response) {
    return this.commandBus.execute<Verify2faCodeCommand, StatusType>(
      new Verify2faCodeCommand(email, code, ctx.req.session),
    );
  }
}
