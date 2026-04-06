#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL?.replace('${DATABASE_USER}', process.env.DATABASE_USER ?? '')
    ?.replace('${DATABASE_PASSWORD}', process.env.DATABASE_PASSWORD ?? '')
    .replace('${DATABASE_HOST}', process.env.DATABASE_HOST ?? '')
    .replace('${DATABASE_PORT}', process.env.DATABASE_PORT ?? '')
    .replace('${DATABASE_DB}', process.env.DATABASE_DB ?? ''),
  entities: [join(__dirname, '../src/grpc-service/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../src/grpc-service/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
});

async function revertLastMigration() {
  try {
    await dataSource.initialize();
    console.log('Reverting last migration...');
    
    await dataSource.undoLastMigration();
    console.log('Successfully reverted last migration');
  } catch (error) {
    console.error('Error reverting migration:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

revertLastMigration();
