import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantDbService } from './tenant.service';
import { Tenant } from './entity/tenant.entity';
import { CustomizationConfig } from './entity/customization-config.entity';
import { DEFAULT_CUSTOMIZATION } from '@app/customization';
import type { Repository } from 'typeorm';

const makeTenant = (overrides: Partial<Tenant> = {}): Tenant =>
  ({
    id: 'tenant-uuid-1',
    slug: 'acme',
    schemaName: 'tenant_acme',
    customizationId: 'cust-uuid-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Tenant;

const makeCustomization = (overrides: Partial<CustomizationConfig> = {}): CustomizationConfig =>
  ({
    id: 'cust-uuid-1',
    tenantId: 'tenant-uuid-1',
    config: { ...DEFAULT_CUSTOMIZATION },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as CustomizationConfig;

describe('TenantDbService', () => {
  let service: TenantDbService;
  let tenantRepo: jest.Mocked<Pick<Repository<Tenant>, 'findOne' | 'find' | 'create' | 'save' | 'update'>>;
  let customizationRepo: jest.Mocked<
    Pick<Repository<CustomizationConfig>, 'findOne' | 'create' | 'save'>
  >;

  beforeEach(() => {
    tenantRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    customizationRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    service = new TenantDbService(
      tenantRepo as unknown as Repository<Tenant>,
      customizationRepo as unknown as Repository<CustomizationConfig>,
    );
  });

  describe('findById', () => {
    it('returns tenant when found', async () => {
      const tenant = makeTenant();
      tenantRepo.findOne.mockResolvedValue(tenant);

      const result = await service.findById('tenant-uuid-1');

      expect(result).toBe(tenant);
      expect(tenantRepo.findOne).toHaveBeenCalledWith({ where: { id: 'tenant-uuid-1' } });
    });

    it('returns null when not found', async () => {
      tenantRepo.findOne.mockResolvedValue(null);
      expect(await service.findById('nonexistent')).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('returns tenant when found by slug', async () => {
      const tenant = makeTenant();
      tenantRepo.findOne.mockResolvedValue(tenant);

      const result = await service.findBySlug('acme');

      expect(result).toBe(tenant);
      expect(tenantRepo.findOne).toHaveBeenCalledWith({ where: { slug: 'acme' } });
    });
  });

  describe('findAll', () => {
    it('returns only active tenants', async () => {
      const tenants = [makeTenant(), makeTenant({ id: 'tenant-2', slug: 'other' })];
      tenantRepo.find.mockResolvedValue(tenants);

      const result = await service.findAll();

      expect(result).toBe(tenants);
      expect(tenantRepo.find).toHaveBeenCalledWith({ where: { isActive: true } });
    });
  });

  describe('create', () => {
    it('creates tenant with derived schemaName and default customization', async () => {
      const tenant = makeTenant();
      const cust = makeCustomization();

      tenantRepo.create.mockReturnValue(tenant);
      tenantRepo.save.mockResolvedValue(tenant);
      tenantRepo.update.mockResolvedValue({ affected: 1 } as any);
      customizationRepo.create.mockReturnValue(cust);
      customizationRepo.save.mockResolvedValue(cust);

      const result = await service.create('acme');

      expect(tenantRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'acme', schemaName: 'tenant_acme' }),
      );
      expect(customizationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ config: DEFAULT_CUSTOMIZATION }),
      );
      expect(result.customizationId).toBe(cust.id);
    });

    it('replaces dashes in slug with underscores for schemaName', async () => {
      const tenant = makeTenant({ slug: 'my-company', schemaName: 'tenant_my_company' });
      const cust = makeCustomization();
      tenantRepo.create.mockReturnValue(tenant);
      tenantRepo.save.mockResolvedValue(tenant);
      tenantRepo.update.mockResolvedValue({ affected: 1 } as any);
      customizationRepo.create.mockReturnValue(cust);
      customizationRepo.save.mockResolvedValue(cust);

      await service.create('my-company');

      expect(tenantRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ schemaName: 'tenant_my_company' }),
      );
    });
  });

  describe('getCustomization', () => {
    it('returns config from DB', async () => {
      const cust = makeCustomization();
      customizationRepo.findOne.mockResolvedValue(cust);

      const result = await service.getCustomization('tenant-uuid-1');

      expect(result).toBe(cust.config);
    });

    it('returns DEFAULT_CUSTOMIZATION when no record found', async () => {
      customizationRepo.findOne.mockResolvedValue(null);

      const result = await service.getCustomization('tenant-uuid-1');

      expect(result).toBe(DEFAULT_CUSTOMIZATION);
    });
  });

  describe('updateCustomization', () => {
    it('merges patch into existing config and saves', async () => {
      const cust = makeCustomization();
      customizationRepo.findOne.mockResolvedValue(cust);
      customizationRepo.save.mockResolvedValue(cust);

      await service.updateCustomization('tenant-uuid-1', {
        branding: { primaryColor: '#ff0000' },
      });

      expect(cust.config.branding.primaryColor).toBe('#ff0000');
      expect(customizationRepo.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when customization record does not exist', async () => {
      customizationRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateCustomization('missing-id', { branding: {} }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when priorityChannels removes both sms and email', async () => {
      const cust = makeCustomization();
      customizationRepo.findOne.mockResolvedValue(cust);

      await expect(
        service.updateCustomization('tenant-uuid-1', {
          messaging: { ...DEFAULT_CUSTOMIZATION.messaging, priorityChannels: ['signal'] },
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
