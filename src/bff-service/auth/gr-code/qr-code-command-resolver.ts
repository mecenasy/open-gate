import { CommandBus } from '@nestjs/cqrs';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { QrChallengeType } from './dto/qr-challenge.type';
import { StatusType } from '../login/dto/status.type';
import { QrLoginCommand } from './commands/impl/qr-login.command';
import { QrRejectCommand } from './commands/impl/qr-reject.command';
import express from 'express';
import { QrOptionCommand } from './commands/impl/qr-option.command';
import GraphQLJSON from 'graphql-type-json';
import { QrConfirmCommand } from './commands/impl/qr-confirm.command';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { Public } from 'src/bff-service/common/decorators/public.decorator';
import { QrChallengeCommand } from './commands/impl/qr-challenge.command';

@Resolver('QrCode')
export class QrCodeCommandsResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => QrChallengeType)
  async qrChallenge(@Args('nonce') nonce: string) {
    return this.commandBus.execute<QrChallengeCommand, QrChallengeType>(new QrChallengeCommand(nonce));
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => StatusType)
  async qrReject(@Context() ctx: express.Response, @Args('challenge') challenge: string) {
    return this.commandBus.execute<QrRejectCommand, void>(new QrRejectCommand(ctx.req.session, challenge));
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => StatusType)
  async qrLogin(@Context() ctx: express.Response, @Args('challenge') challenge: string, @Args('nonce') nonce: string) {
    return this.commandBus.execute<QrLoginCommand, StatusType>(new QrLoginCommand(ctx.req.session, challenge, nonce));
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => GraphQLJSON)
  async qrOption(@Context() ctx: express.Response, @Args('challenge') challenge: string, @Args('nonce') nonce: string) {
    return await this.commandBus.execute<QrOptionCommand, PublicKeyCredentialRequestOptionsJSON>(
      new QrOptionCommand(challenge, nonce, ctx.req.session),
    );
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Mutation(() => StatusType)
  async qrConfirm(
    @Context() ctx: express.Response,
    @Args('challenge') challenge: string,
    @Args('data', { type: () => GraphQLJSON }) data: AuthenticationResponseJSON,
  ) {
    return await this.commandBus.execute<QrConfirmCommand, void>(new QrConfirmCommand(challenge, data));
  }
}
