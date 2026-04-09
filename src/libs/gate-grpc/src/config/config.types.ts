import * as Joi from 'joi';
import { Config } from './config';

export interface ConfigTypes {
  grpc: Config;
}

export const configSchema = Joi.object({
  GATE_GRPC_URL: Joi.string().required(),
});
