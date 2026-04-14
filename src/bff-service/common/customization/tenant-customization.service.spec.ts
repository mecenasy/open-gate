import { of, throwError } from 'rxjs';
import { TenantCustomizationService } from './tenant-customization.service';
import { TenantService } from '@app/tenant';
import { DEFAULT_CUSTOMIZATION } from '@app/customization';
import type { ClientGrpc } from '@nestjs/microservices';
import type { TenantServiceClient } from 'src/proto/tenant';

const makeCustomization = () => ({
  ...DEFAULT_CUSTOMIZATION,
  features: { ...DEFAULT_CUSTOMIZATION.features, enableGate: false },
});

describe('TenantCustomizationService', () => {
  let service: TenantCustomizationService;
  let tenantService: TenantService;
  let mockGrpcClient: jest.Mocked<Pick<ClientGrpc, 'getService'>>;
  let mockTenantGrpc: jest.Mocked<Pick<TenantServiceClient, 'getCustomization'>>;

  beforeEach(() => {
    tenantService = new TenantService();
    mockTenantGrpc = { getCustomization: jest.fn() };
    mockGrpcClient = {
      getService: jest.fn().mockReturnValue(mockTenantGrpc),
    };

    service = new TenantCustomizationService(tenantService);
    Object.assign(service, { grpcClient: mockGrpcClient });
    service.onModuleInit();
  });

  describe('getForTenant', () => {
    it('fetches customization via gRPC and returns parsed result', async () => {
      const customization = makeCustomization();
      mockTenantGrpc.getCustomization.mockReturnValue(
        of({ status: true, message: 'ok', customizationJson: JSON.stringify(customization) }),
      );

      const result = await service.getForTenant('tenant-1');

      expect(result.features.enableGate).toBe(false);
      expect(mockTenantGrpc.getCustomization).toHaveBeenCalledWith({ tenantId: 'tenant-1' });
    });

    it('returns DEFAULT_CUSTOMIZATION when gRPC returns status=false', async () => {
      mockTenantGrpc.getCustomization.mockReturnValue(
        of({ status: false, message: 'not found', customizationJson: '' }),
      );

      const result = await service.getForTenant('unknown-tenant');

      expect(result).toBe(DEFAULT_CUSTOMIZATION);
    });

    it('returns DEFAULT_CUSTOMIZATION when gRPC throws', async () => {
      mockTenantGrpc.getCustomization.mockReturnValue(throwError(() => new Error('gRPC down')));

      const result = await service.getForTenant('tenant-1');

      expect(result).toBe(DEFAULT_CUSTOMIZATION);
    });

    it('caches result and does not call gRPC again on second request', async () => {
      const customization = makeCustomization();
      mockTenantGrpc.getCustomization.mockReturnValue(
        of({ status: true, message: 'ok', customizationJson: JSON.stringify(customization) }),
      );

      await service.getForTenant('tenant-1');
      await service.getForTenant('tenant-1');

      expect(mockTenantGrpc.getCustomization).toHaveBeenCalledTimes(1);
    });

    it('calls gRPC again after invalidating cache', async () => {
      const customization = makeCustomization();
      mockTenantGrpc.getCustomization.mockReturnValue(
        of({ status: true, message: 'ok', customizationJson: JSON.stringify(customization) }),
      );

      await service.getForTenant('tenant-1');
      service.invalidate('tenant-1');
      await service.getForTenant('tenant-1');

      expect(mockTenantGrpc.getCustomization).toHaveBeenCalledTimes(2);
    });
  });

  describe('getForCurrentTenant', () => {
    it('returns DEFAULT_CUSTOMIZATION when no tenant context is set', async () => {
      const result = await service.getForCurrentTenant();
      expect(result).toBe(DEFAULT_CUSTOMIZATION);
    });

    it('fetches for the current tenant from context', async () => {
      const customization = makeCustomization();
      mockTenantGrpc.getCustomization.mockReturnValue(
        of({ status: true, message: 'ok', customizationJson: JSON.stringify(customization) }),
      );

      await tenantService.runInContext(
        {
          tenantId: 'ctx-tenant',
          tenantSlug: 'ctx',
          schemaName: 'tenant_ctx',
          correlationId: '',
          resolutionSource: 0 as any,
        },
        async () => {
          const result = await service.getForCurrentTenant();
          expect(mockTenantGrpc.getCustomization).toHaveBeenCalledWith({ tenantId: 'ctx-tenant' });
          expect(result.features.enableGate).toBe(false);
        },
      );
    });
  });
});
