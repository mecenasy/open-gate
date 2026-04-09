import { AppConfig } from './app.configs';
import * as Joi from 'joi';
import { SessionConfig } from './session.config';
import { RedisConfig } from 'src/gate-service/common/redis/config/redis.config';

export interface ConfigTypes {
  app: AppConfig;
  session: SessionConfig;
  redis: RedisConfig;
}

export const configSchema = Joi.object({
  REDIS_URL: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
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
