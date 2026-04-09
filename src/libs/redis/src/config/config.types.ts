import * as Joi from 'joi';
import { RedisConfig } from './redis.config';

export interface ConfigTypes {
  redis: RedisConfig;
}

export const configSchema = Joi.object({
  REDIS_URL: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.string().required(),
});
