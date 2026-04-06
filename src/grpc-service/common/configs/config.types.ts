import * as Joi from 'joi';
import { GrpcConfig } from '../proxy/config/proxy.config';
import { PostgresConfig } from '../postgres/config/postgres.config';

export interface ConfigTypes {
  db: PostgresConfig;
  grpc: GrpcConfig;
}

export const configSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  GRPC_URL: Joi.string().required(),
  GRPC_PORT: Joi.number().required(),
});
