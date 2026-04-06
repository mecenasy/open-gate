#!/usr/bin/env ts-node

import { config } from 'dotenv';
import { execSync } from 'child_process';
import { join } from 'path';

// Load environment variables
config();

function generateMigration(name?: string) {
  try {
    const migrationName = name || `migration_${Date.now()}`;
    console.log(`Generating migration: ${migrationName}`);

    // Create migrations directory if it doesn't exist
    const migrationsDir = join(__dirname, '../src/db-service/migrations');
    const migrationPath = join(migrationsDir, `${migrationName}.ts`);

    // Use TypeORM CLI to generate migration
    const command = `npm run typeorm -- migration:create -d typeorm.config.ts "${migrationPath}"`;
    console.log(`Running: ${command}`);

    execSync(command, { stdio: 'inherit' });

    console.log(`Migration ${migrationName} generated successfully at: ${migrationPath}`);
  } catch (error) {
    console.error('Error generating migration:', error);
    process.exit(1);
  }
}

// Get migration name from command line arguments
const migrationName = process.argv[2];
void generateMigration(migrationName);
