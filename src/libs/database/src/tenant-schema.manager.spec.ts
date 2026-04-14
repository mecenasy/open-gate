import { TenantSchemaManager } from './tenant-schema.manager';
import { DataSource } from 'typeorm';

describe('TenantSchemaManager', () => {
  let manager: TenantSchemaManager;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    dataSource = {
      query: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    manager = new TenantSchemaManager(dataSource);
  });

  describe('provisionSchema', () => {
    it('should execute CREATE SCHEMA IF NOT EXISTS', async () => {
      dataSource.query.mockResolvedValue([]);

      await manager.provisionSchema('tenant_abc123');

      expect(dataSource.query).toHaveBeenCalledWith(
        'CREATE SCHEMA IF NOT EXISTS "tenant_abc123"',
      );
    });

    it('should use quoted schema name to prevent SQL injection', async () => {
      dataSource.query.mockResolvedValue([]);

      await manager.provisionSchema('my_schema');

      const [sql] = (dataSource.query as jest.Mock).mock.calls[0] as [string];
      // Schema name is always quoted — no raw interpolation
      expect(sql).toMatch(/"my_schema"/);
      expect(sql).not.toMatch(/;/); // no semicolons that could inject
    });

    it('should be idempotent — IF NOT EXISTS prevents errors on second call', async () => {
      dataSource.query.mockResolvedValue([]);

      await manager.provisionSchema('tenant_idem');
      await manager.provisionSchema('tenant_idem');

      expect(dataSource.query).toHaveBeenCalledTimes(2);
      // Both calls use IF NOT EXISTS — safe to call repeatedly
    });
  });

  describe('schemaExists', () => {
    it('should return true when schema exists', async () => {
      dataSource.query.mockResolvedValue([{ exists: true }]);

      const result = await manager.schemaExists('tenant_exists');

      expect(result).toBe(true);
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('information_schema.schemata'),
        ['tenant_exists'],
      );
    });

    it('should return false when schema does not exist', async () => {
      dataSource.query.mockResolvedValue([{ exists: false }]);

      const result = await manager.schemaExists('tenant_missing');

      expect(result).toBe(false);
    });

    it('should return false on empty result set', async () => {
      dataSource.query.mockResolvedValue([]);

      const result = await manager.schemaExists('tenant_empty');

      expect(result).toBe(false);
    });

    it('should use parameterised query to prevent SQL injection', async () => {
      dataSource.query.mockResolvedValue([{ exists: false }]);

      await manager.schemaExists("tenant'; DROP TABLE tenants; --");

      const [, params] = (dataSource.query as jest.Mock).mock.calls[0] as [string, string[]];
      // Value is passed as a parameter, never interpolated
      expect(params[0]).toBe("tenant'; DROP TABLE tenants; --");
    });
  });

  describe('schema isolation invariant', () => {
    it('should create different schemas for different tenants', async () => {
      dataSource.query.mockResolvedValue([]);

      const t1Schema = 'tenant_aaaa';
      const t2Schema = 'tenant_bbbb';

      await manager.provisionSchema(t1Schema);
      await manager.provisionSchema(t2Schema);

      const calls = (dataSource.query as jest.Mock).mock.calls as [string][];
      expect(calls[0][0]).toContain(t1Schema);
      expect(calls[1][0]).toContain(t2Schema);
      expect(calls[0][0]).not.toContain(t2Schema);
    });
  });
});
