import { ExecutionContext } from '@nestjs/common';
import { FeatureFlagGuard } from './feature-flag.guard';
import { TenantCustomizationService } from '../customization/tenant-customization.service';
import { DEFAULT_CUSTOMIZATION } from '@app/customization';
import type { CommunityCustomization } from '@app/customization';

const makeCustomization = (overrides: Partial<CommunityCustomization['features']> = {}): CommunityCustomization => ({
  ...DEFAULT_CUSTOMIZATION,
  features: { ...DEFAULT_CUSTOMIZATION.features, ...overrides },
});

const makeContext = (): ExecutionContext => ({} as ExecutionContext);

describe('FeatureFlagGuard', () => {
  let customizationService: jest.Mocked<Pick<TenantCustomizationService, 'getForCurrentTenant'>>;

  beforeEach(() => {
    customizationService = {
      getForCurrentTenant: jest.fn(),
    };
  });

  it('returns true when the feature is enabled', async () => {
    customizationService.getForCurrentTenant.mockResolvedValue(
      makeCustomization({ enableGate: true }),
    );

    const GuardClass = FeatureFlagGuard('enableGate');
    const guard = new GuardClass(customizationService as unknown as TenantCustomizationService);

    const result = await guard.canActivate(makeContext());
    expect(result).toBe(true);
  });

  it('returns false when the feature is disabled', async () => {
    customizationService.getForCurrentTenant.mockResolvedValue(
      makeCustomization({ enableGate: false }),
    );

    const GuardClass = FeatureFlagGuard('enableGate');
    const guard = new GuardClass(customizationService as unknown as TenantCustomizationService);

    const result = await guard.canActivate(makeContext());
    expect(result).toBe(false);
  });

  it('works for enablePayment flag', async () => {
    customizationService.getForCurrentTenant.mockResolvedValue(
      makeCustomization({ enablePayment: true }),
    );

    const GuardClass = FeatureFlagGuard('enablePayment');
    const guard = new GuardClass(customizationService as unknown as TenantCustomizationService);

    expect(await guard.canActivate(makeContext())).toBe(true);
  });

  it('creates distinct guard classes for each feature', () => {
    const GateGuard = FeatureFlagGuard('enableGate');
    const PaymentGuard = FeatureFlagGuard('enablePayment');
    expect(GateGuard).not.toBe(PaymentGuard);
  });
});
