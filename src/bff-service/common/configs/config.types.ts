import { AppConfig } from './app.configs';
import * as Joi from 'joi';
import { SessionConfig } from './session.config';

export interface ConfigTypes {
  app: AppConfig;
  session: SessionConfig;
}

export const configSchema = Joi.object({
  MODE: Joi.string().required(),
  SESSION_SECRET: Joi.string().required(),
  SESSION_NAME: Joi.string().required(),
  SESSION_MAX_AGE: Joi.string().required(),
  SESSION_HTTP_ONLY: Joi.string().required(),
  SESSION_FOLDER: Joi.string().required(),
  ALLOWED_ORIGIN: Joi.string().required(),
  APP_URL: Joi.string().required(),
  ADMIN_PASSWORD: Joi.string().required(),
  ADMIN_EMAIL: Joi.string().required(),
  ADMIN_PHONE: Joi.string().required(),
  COOKIE_SECRET: Joi.string().required(),
});
