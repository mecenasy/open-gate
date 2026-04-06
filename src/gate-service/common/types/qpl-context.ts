import express from 'express';

export interface GqlContext {
  req: express.Request;
  res: express.Response;
}
