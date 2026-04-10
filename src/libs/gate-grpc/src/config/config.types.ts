import * as Joi from 'joi';
import { Config } from './config';

export interface ConfigTypes {
  'gate-grpc': Config;
}

export const schema: Joi.ObjectSchema = Joi.object({
  GATE_GRPC_URL: Joi.string().required(),
});
