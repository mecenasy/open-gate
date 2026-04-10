import * as Joi from 'joi';
import { Config } from './config';

export interface ConfigTypes {
  grpc: Config;
}

export const schema: Joi.ObjectSchema = Joi.object({
  NOTIFY_GRPC_URL: Joi.string().required(),
});
