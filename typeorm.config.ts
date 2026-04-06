import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();
const isProductionDB =
  typeof process.env.MODE === 'string' && process.env.MODE === 'production';

export default new DataSource(
  isProductionDB
    ? {
      type: 'postgres',
      ssl: {
        rejectUnauthorized: false,
      },
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/src/db-service/migrations/*{.ts,.js}'],
    }
    : {
      type: 'postgres',
      url: process.env.DATABASE_URL?.replace(
        '${DATABASE_USER}',
        process.env.DATABASE_USER ?? '',
      )
        ?.replace('${DATABASE_PASSWORD}', process.env.DATABASE_PASSWORD ?? '')
        .replace('${DATABASE_HOST}', process.env.DATABASE_HOST ?? '')
        .replace('${DATABASE_PORT}', process.env.DATABASE_PORT ?? '')
        .replace('${DATABASE_DB}', process.env.DATABASE_DB ?? ''),
      synchronize: process.env.DATABASE_SYNC === '1',
      entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/src/db-service/migrations/*{.ts,.js}'],
    },
);
