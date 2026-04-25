import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantSchemaManager {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async provisionSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  }

  async schemaExists(schemaName: string): Promise<boolean> {
    const result = await this.dataSource.query<{ exists: boolean }[]>(
      `SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = $1) AS exists`,
      [schemaName],
    );
    return result[0]?.exists ?? false;
  }

  async dropSchema(schemaName: string): Promise<void> {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schemaName)) {
      throw new Error(`Refusing to drop schema with unsafe name: ${schemaName}`);
    }
    await this.dataSource.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  }
}
