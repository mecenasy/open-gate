import * as Joi from 'joi';
import { Config } from './config';

export interface ConfigTypes {
  'bff-grpc': Config;
}

export const schema: Joi.ObjectSchema = Joi.object({
  BFF_GRPC_URL: Joi.string().required(),
});
