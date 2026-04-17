import { CommandBus } from '@nestjs/cqrs';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { RemovePasskeyCommand } from './commands/impl/remove-passkey.command';
import { RemovePasskeyType } from './dto/remove.passkey';
import GraphQLJSON from 'graphql-type-json';
import { PasskeyOptionCommand } from './commands/impl/passkey-option.command';
import express from 'express';
import { VerifyPasskeyCommand } from './commands/impl/verify-passkey.command.';
import { StatusType } from '../login/dto/status.type';
import type {
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { RegisterPasskeyOptionCommand } from './commands/impl/register-passkey-option.command';
import { VerifyRegistrationOptionCommand } from './commands/impl/verify-registration-option.command';
import { Headers } from '@nestjs/common';
import { CurrentUserId, Public } from '@app/auth';

@Resolver('Passkey')
export class PasskeyCommandsResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => RemovePasskeyType)
  async removePasskey(@Args('id') id: string, @CurrentUserId() userId: string) {
    return this.commandBus.execute<RemovePasskeyCommand, RemovePasskeyType>(new RemovePasskeyCommand(id, userId));
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => GraphQLJSON)
  async optionPasskey(@Context() ctx: express.Response) {
    const origin = ctx.req.headers?.origin;
    return await this.commandBus.execute<PasskeyOptionCommand, PublicKeyCredentialRequestOptionsJSON>(
      new PasskeyOptionCommand(ctx.req.session, origin),
    );
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => GraphQLJSON)
  async registerOptionPasskey(@CurrentUserId() userId: string, @Context() ctx: express.Response) {
    const origin = ctx.req.headers?.origin;
    return await this.commandBus.execute<RegisterPasskeyOptionCommand, PublicKeyCredentialCreationOptionsJSON>(
      new RegisterPasskeyOptionCommand(userId, origin),
    );
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => StatusType)
  async registerOptionPasskeyVerify(
    @Args('data', { type: () => GraphQLJSON }) data: RegistrationResponseJSON,
    @Headers('user-agent') ua: string,
    @CurrentUserId() userId: string,
    @Context() ctx: express.Response,
  ) {
    const origin = ctx.req.headers?.origin;
    return await this.commandBus.execute<VerifyRegistrationOptionCommand, StatusType>(
      new VerifyRegistrationOptionCommand(userId, data, ua, origin),
    );
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => StatusType)
  async optionPasskeyVerify(
    @Args('data', { type: () => GraphQLJSON }) data: AuthenticationResponseJSON,
    @Context() ctx: express.Response,
  ) {
    const origin = ctx.req.headers?.origin;
    return await this.commandBus.execute<VerifyPasskeyCommand, StatusType>(
      new VerifyPasskeyCommand(ctx.req.session, data, origin),
    );
  }
}
