import { DynamicDataSourceProvider } from './dynamic-data-source.provider';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

jest.mock('typeorm', () => {
  const actual = jest.requireActual<typeof import('typeorm')>('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(() => ({
      isInitialized: false,
      initialize: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

const MockedDataSource = DataSource as jest.MockedClass<typeof DataSource>;

describe('DynamicDataSourceProvider', () => {
  let provider: DynamicDataSourceProvider;
  let configService: jest.Mocked<ConfigService>;

  const DB_URL = 'postgresql://user:pass@localhost:5432/testdb';

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue(DB_URL),
    } as unknown as jest.Mocked<ConfigService>;

    provider = new DynamicDataSourceProvider(configService);
    MockedDataSource.mockClear();
  });

  describe('getDataSource', () => {
    it('should create a new DataSource for a tenant', async () => {
      const instance = { isInitialized: false, initialize: jest.fn().mockResolvedValue(undefined), destroy: jest.fn() };
      MockedDataSource.mockImplementationOnce(() => instance as unknown as DataSource);

      const ds = await provider.getDataSource('tenant-1', 'tenant_1');

      expect(MockedDataSource).toHaveBeenCalledTimes(1);
      expect(instance.initialize).toHaveBeenCalledTimes(1);
      expect(ds).toBe(instance);
    });

    it('should cache DataSource per tenantId', async () => {
      const instance = { isInitialized: true, initialize: jest.fn(), destroy: jest.fn() };
      MockedDataSource.mockImplementationOnce(() => instance as unknown as DataSource);

      await provider.getDataSource('tenant-cache', 'tenant_cache');
      await provider.getDataSource('tenant-cache', 'tenant_cache');

      // DataSource constructor called only once — second call hits cache
      expect(MockedDataSource).toHaveBeenCalledTimes(1);
    });

    it('should create separate DataSources for different tenants', async () => {
      const inst1 = { isInitialized: false, initialize: jest.fn().mockResolvedValue(undefined), destroy: jest.fn() };
      const inst2 = { isInitialized: false, initialize: jest.fn().mockResolvedValue(undefined), destroy: jest.fn() };
      MockedDataSource.mockImplementationOnce(() => inst1 as unknown as DataSource)
        .mockImplementationOnce(() => inst2 as unknown as DataSource);

      const ds1 = await provider.getDataSource('tenant-a', 'schema_a');
      const ds2 = await provider.getDataSource('tenant-b', 'schema_b');

      expect(ds1).toBe(inst1);
      expect(ds2).toBe(inst2);
      expect(ds1).not.toBe(ds2);
    });

    it('should set search_path in connection options', async () => {
      const instance = { isInitialized: false, initialize: jest.fn().mockResolvedValue(undefined), destroy: jest.fn() };
      MockedDataSource.mockImplementationOnce(() => instance as unknown as DataSource);

      await provider.getDataSource('tenant-sp', 'my_schema');

      const callArgs = MockedDataSource.mock.calls[0][0] as { extra: { options: string } };
      expect(callArgs.extra.options).toContain('search_path=my_schema');
    });
  });

  describe('onModuleDestroy', () => {
    it('should destroy all initialized DataSources', async () => {
      const inst = { isInitialized: true, initialize: jest.fn(), destroy: jest.fn().mockResolvedValue(undefined) };
      MockedDataSource.mockImplementationOnce(() => inst as unknown as DataSource);

      // getDataSource skips init because isInitialized is already true
      await provider.getDataSource('destroy-test', 'schema');
      await provider.onModuleDestroy();

      expect(inst.destroy).toHaveBeenCalledTimes(1);
    });

    it('should skip non-initialized DataSources on destroy', async () => {
      const inst = { isInitialized: false, initialize: jest.fn().mockResolvedValue(undefined), destroy: jest.fn() };
      MockedDataSource.mockImplementationOnce(() => inst as unknown as DataSource);

      await provider.getDataSource('no-init', 'schema');
      // isInitialized is false after mock init
      await provider.onModuleDestroy();

      expect(inst.destroy).not.toHaveBeenCalled();
    });
  });

  describe('tenant schema isolation contract', () => {
    it('should use different search_path for different tenants', async () => {
      const inst1 = { isInitialized: false, initialize: jest.fn().mockResolvedValue(undefined), destroy: jest.fn() };
      const inst2 = { isInitialized: false, initialize: jest.fn().mockResolvedValue(undefined), destroy: jest.fn() };
      MockedDataSource.mockImplementationOnce(() => inst1 as unknown as DataSource)
        .mockImplementationOnce(() => inst2 as unknown as DataSource);

      await provider.getDataSource('t1', 'schema_tenant_1');
      await provider.getDataSource('t2', 'schema_tenant_2');

      const opts1 = MockedDataSource.mock.calls[0][0] as { extra: { options: string } };
      const opts2 = MockedDataSource.mock.calls[1][0] as { extra: { options: string } };

      expect(opts1.extra.options).toContain('schema_tenant_1');
      expect(opts2.extra.options).toContain('schema_tenant_2');
      expect(opts1.extra.options).not.toContain('schema_tenant_2');
    });
  });
});
