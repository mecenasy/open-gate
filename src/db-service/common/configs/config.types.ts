import * as Joi from 'joi';
import { PostgresConfig } from '../postgres/config/postgres.config';

export interface ConfigTypes {
  db: PostgresConfig;
}

export const schema: Joi.ObjectSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
});
