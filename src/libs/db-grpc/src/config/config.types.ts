import * as Joi from 'joi';
import { Config } from './config';

export interface ConfigTypes {
  'db-grpc': Config;
}

export const schema: Joi.ObjectSchema = Joi.object({
  DB_GRPC_URL: Joi.string().required(),
});
