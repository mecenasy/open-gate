import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import express from 'express';
import { StatusAuthQuery } from './queries/impl/status-auth.query';
import { LoginStatusType } from './dto/login-status.tape';
import { VerifyTokenQuery } from './queries/impl/verify-token.query';
import { Public, CurrentUserId } from '@app/auth';
import { VerifyTokenType } from './dto/verify-token.type';

@Resolver('Login')
export class LoginQueriesResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Query(() => LoginStatusType)
  async loginStatus(@CurrentUserId() userId: string) {
    return this.queryBus.execute<StatusAuthQuery, LoginStatusType>(new StatusAuthQuery(userId));
  }

  @Public()
  @Query(() => VerifyTokenType)
  async verifyToken(@Args('token') token: string) {
    return this.queryBus.execute<VerifyTokenQuery, VerifyTokenType>(new VerifyTokenQuery(token));
  }
}
