import * as Joi from 'joi';
import { Config } from './redis.config';

export interface ConfigTypes {
  redis: Config;
}

export const schema: Joi.ObjectSchema = Joi.object({
  REDIS_URL: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),
});
