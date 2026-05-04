import { PhoneProvisionedBy } from '@app/entities';
import type { TenantPhoneNumberEntry } from 'src/proto/phone-procurement';
import type { PhoneProcurementDbClient } from './db/phone-procurement-db.client';
import type { PhoneProcurementService } from './phone-procurement.service';
import type { PlatformConfigService } from '../platform-config/platform-config.service';
import type { SignalRestClient } from '../onboarding/platforms/signal/signal-rest.client';
import { TenantPlatformCleanupService } from './tenant-platform-cleanup.service';

function tenantPhone(over: Partial<TenantPhoneNumberEntry> = {}): TenantPhoneNumberEntry {
  return {
    id: 'tpn-1',
    tenantId: 't-1',
    phoneE164: '+48999',
    providerKey: 'twilio',
    providerExternalId: 'PN1',
    provisionedBy: PhoneProvisionedBy.Managed,
    monthlyMessageCount: 0,
    lastSyncedAt: '',
    purchasedAt: '2026-01-01T00:00:00Z',
    ...over,
  };
}

describe('TenantPlatformCleanupService.unregisterAll', () => {
  let procurement: jest.Mocked<PhoneProcurementService>;
  let db: jest.Mocked<PhoneProcurementDbClient>;
  let cfg: jest.Mocked<PlatformConfigService>;
  let signal: jest.Mocked<SignalRestClient>;
  let svc: TenantPlatformCleanupService;

  beforeEach(() => {
    procurement = {
      releaseFromProvider: jest.fn().mockResolvedValue({ externalId: 'PN1', released: true }),
    } as unknown as jest.Mocked<PhoneProcurementService>;
    db = {
      getTenantPhoneNumber: jest.fn(),
    } as unknown as jest.Mocked<PhoneProcurementDbClient>;
    cfg = {
      getConfig: jest.fn(),
    } as unknown as jest.Mocked<PlatformConfigService>;
    signal = {
      unregister: jest.fn(),
    } as unknown as jest.Mocked<SignalRestClient>;

    svc = new TenantPlatformCleanupService(procurement, db, cfg, signal);
    jest
      .spyOn((svc as unknown as { logger: { warn: jest.Mock; error: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .spyOn((svc as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
  });

  describe('twilio platform', () => {
    it('skips when no number is attached', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(null);
      cfg.getConfig.mockResolvedValue(null);

      const res = await svc.unregisterAll('t-1');
      const tw = res.find((r) => r.platform === 'twilio')!;
      expect(tw).toEqual({ platform: 'twilio', status: true, message: 'no number attached' });
      expect(procurement.releaseFromProvider).not.toHaveBeenCalled();
    });

    it('skips self-provisioned numbers (we never owned the SID)', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(tenantPhone({ provisionedBy: PhoneProvisionedBy.Self }));
      cfg.getConfig.mockResolvedValue(null);

      const res = await svc.unregisterAll('t-1');
      const tw = res.find((r) => r.platform === 'twilio')!;
      expect(tw.status).toBe(true);
      expect(tw.message).toContain('self-provisioned');
      expect(procurement.releaseFromProvider).not.toHaveBeenCalled();
    });

    it('releases managed numbers via originating provider', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(tenantPhone());
      cfg.getConfig.mockResolvedValue(null);

      const res = await svc.unregisterAll('t-1');
      const tw = res.find((r) => r.platform === 'twilio')!;
      expect(tw).toEqual({ platform: 'twilio', status: true, message: 'released' });
      expect(procurement.releaseFromProvider).toHaveBeenCalledWith('twilio', 'PN1');
    });

    it('treats 404 from provider as already-released (idempotent)', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(tenantPhone());
      cfg.getConfig.mockResolvedValue(null);
      const err = Object.assign(new Error('not found'), { status: 404 });
      procurement.releaseFromProvider.mockRejectedValue(err);

      const res = await svc.unregisterAll('t-1');
      const tw = res.find((r) => r.platform === 'twilio')!;
      expect(tw.status).toBe(true);
      expect(tw.message).toContain('already released');
    });

    it('returns failure message for non-404 provider errors', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(tenantPhone());
      cfg.getConfig.mockResolvedValue(null);
      procurement.releaseFromProvider.mockRejectedValue(new Error('server error'));

      const res = await svc.unregisterAll('t-1');
      const tw = res.find((r) => r.platform === 'twilio')!;
      expect(tw.status).toBe(false);
      expect(tw.message).toContain('server error');
    });

    it('catches errors thrown by getTenantPhoneNumber', async () => {
      db.getTenantPhoneNumber.mockRejectedValue(new Error('db down'));
      cfg.getConfig.mockResolvedValue(null);

      const res = await svc.unregisterAll('t-1');
      const tw = res.find((r) => r.platform === 'twilio')!;
      expect(tw.status).toBe(false);
      expect(tw.message).toContain('db down');
    });
  });

  describe('signal platform', () => {
    it('skips when no Signal account is configured', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(null);
      cfg.getConfig.mockResolvedValue(null);

      const res = await svc.unregisterAll('t-1');
      const s = res.find((r) => r.platform === 'signal')!;
      expect(s).toEqual({ platform: 'signal', status: true, message: 'no account configured' });
      expect(signal.unregister).not.toHaveBeenCalled();
    });

    it('skips when account or apiUrl is empty', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(null);
      cfg.getConfig.mockResolvedValue({ apiUrl: '', account: '+1' } as never);

      const res = await svc.unregisterAll('t-1');
      const s = res.find((r) => r.platform === 'signal')!;
      expect(s.status).toBe(true);
      expect(signal.unregister).not.toHaveBeenCalled();
    });

    it('returns success when signal-cli unregister returns ok', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(null);
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: '+1' } as never);
      signal.unregister.mockResolvedValue({ ok: true });

      const res = await svc.unregisterAll('t-1');
      const s = res.find((r) => r.platform === 'signal')!;
      expect(s).toEqual({ platform: 'signal', status: true, message: 'unregistered' });
    });

    it('returns failure with message when signal-cli reports !ok', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(null);
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: '+1' } as never);
      signal.unregister.mockResolvedValue({ ok: false, message: 'not registered' });

      const res = await svc.unregisterAll('t-1');
      const s = res.find((r) => r.platform === 'signal')!;
      expect(s.status).toBe(false);
      expect(s.message).toContain('not registered');
    });

    it('falls back to "unregister failed" when signal-cli reports !ok with no message', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(null);
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: '+1' } as never);
      signal.unregister.mockResolvedValue({ ok: false });

      const res = await svc.unregisterAll('t-1');
      const s = res.find((r) => r.platform === 'signal')!;
      expect(s.message).toBe('unregister failed');
    });

    it('catches thrown errors from signal-cli', async () => {
      db.getTenantPhoneNumber.mockResolvedValue(null);
      cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: '+1' } as never);
      signal.unregister.mockRejectedValue(new Error('boom'));

      const res = await svc.unregisterAll('t-1');
      const s = res.find((r) => r.platform === 'signal')!;
      expect(s.status).toBe(false);
      expect(s.message).toContain('boom');
    });
  });

  it('runs both handlers in parallel and isolates failures', async () => {
    db.getTenantPhoneNumber.mockRejectedValue(new Error('db down'));
    cfg.getConfig.mockResolvedValue({ apiUrl: 'http://signal:8080', account: '+1' } as never);
    signal.unregister.mockResolvedValue({ ok: true });

    const res = await svc.unregisterAll('t-1');
    expect(res.find((r) => r.platform === 'twilio')!.status).toBe(false);
    expect(res.find((r) => r.platform === 'signal')!.status).toBe(true);
  });
});
