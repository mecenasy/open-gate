import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Context } from '../types/context';
import express from 'express';

export const CurrentUserGpl = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  const req: express.Request = ctx.getContext<Context>().req;

  return req.user;
});
