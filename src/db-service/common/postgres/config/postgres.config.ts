import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isProductionDB = typeof process.env.MODE === 'string' && process.env.MODE === 'production';

const poolOptions = {
  extra: {
    max: parseInt(process.env.POSTGRES_POOL_MAX ?? '10'),
    min: parseInt(process.env.POSTGRES_POOL_MIN ?? '2'),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 3_000,
  },
};

export type PostgresConfig = TypeOrmModuleOptions;

export const postgresConfig = registerAs(
  'db',
  (): PostgresConfig =>
    isProductionDB
      ? {
          type: 'postgres',
          ssl: {
            rejectUnauthorized: false,
          },
          url: process.env.DATABASE_URL,
          synchronize: false,
          ...poolOptions,
        }
      : {
          type: 'postgres',
          url: process.env.DATABASE_URL?.replace('${DATABASE_USER}', process.env.DATABASE_USER ?? '')
            ?.replace('${DATABASE_PASSWORD}', process.env.DATABASE_PASSWORD ?? '')
            .replace('${DATABASE_HOST}', process.env.DATABASE_HOST ?? '')
            .replace('${DATABASE_PORT}', process.env.DATABASE_PORT ?? '')
            .replace('${DATABASE_DB}', process.env.DATABASE_DB ?? ''),
          synchronize: process.env.DATABASE_SYNC === '1',
          ...poolOptions,
        },
);
