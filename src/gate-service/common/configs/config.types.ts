import { AppConfig } from './app.configs';
import * as Joi from 'joi';

export interface ConfigTypes {
  app: AppConfig;
}

export const configSchema = Joi.object({
  MODE: Joi.string().required(),
});
