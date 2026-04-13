import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class DynamicDataSourceProvider implements OnModuleDestroy {
  private readonly cache = new Map<string, DataSource>();

  constructor(private readonly configService: ConfigService) {}

  async getDataSource(tenantId: string, schemaName: string): Promise<DataSource> {
    const existing = this.cache.get(tenantId);
    if (existing?.isInitialized) {
      return existing;
    }

    const baseUrl = this.resolveUrl();
    const isProduction = process.env.MODE === 'production';

    const options: DataSourceOptions = {
      type: 'postgres',
      url: baseUrl,
      ...(isProduction ? { ssl: { rejectUnauthorized: false } } : {}),
      extra: {
        max: 5,
        min: 1,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 3_000,
        options: `-c search_path=${schemaName},public`,
      },
    };

    const ds = new DataSource(options);
    await ds.initialize();
    this.cache.set(tenantId, ds);
    return ds;
  }

  async executeInTenantContext<T>(
    tenantId: string,
    schemaName: string,
    fn: (ds: DataSource) => Promise<T>,
  ): Promise<T> {
    const ds = await this.getDataSource(tenantId, schemaName);
    return fn(ds);
  }

  async onModuleDestroy(): Promise<void> {
    const closings = Array.from(this.cache.values())
      .filter((ds) => ds.isInitialized)
      .map((ds) => ds.destroy());
    await Promise.all(closings);
    this.cache.clear();
  }

  private resolveUrl(): string {
    const raw = this.configService.getOrThrow<string>('DATABASE_URL');
    return raw
      .replace('${DATABASE_USER}', process.env.DATABASE_USER ?? '')
      .replace('${DATABASE_PASSWORD}', process.env.DATABASE_PASSWORD ?? '')
      .replace('${DATABASE_HOST}', process.env.DATABASE_HOST ?? '')
      .replace('${DATABASE_PORT}', process.env.DATABASE_PORT ?? '')
      .replace('${DATABASE_DB}', process.env.DATABASE_DB ?? '');
  }
}
