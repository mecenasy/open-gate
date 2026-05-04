import type {
  PendingPurchaseEntry,
  PurchasePhoneNumberRequest,
  ReleasePendingPurchaseRequest,
  UnregisterTenantPlatformsRequest,
} from 'src/proto/phone-procurement';
import { PhoneProcurementNotifyController } from './phone-procurement.controller';
import type { PhoneProcurementService } from './phone-procurement.service';
import type { PhoneProcurementDbClient } from './db/phone-procurement-db.client';
import type { TenantPlatformCleanupService } from './tenant-platform-cleanup.service';

function pending(over: Partial<PendingPurchaseEntry> = {}): PendingPurchaseEntry {
  return {
    id: 'pp-1',
    ownerUserId: 'u-1',
    providerKey: 'twilio',
    providerExternalId: 'PN1',
    phoneE164: '+48999',
    attachedToTenantId: '',
    purchasedAt: '2026-01-01T00:00:00Z',
    attachedAt: '',
    ...over,
  };
}

describe('PhoneProcurementNotifyController', () => {
  let procurement: jest.Mocked<PhoneProcurementService>;
  let db: jest.Mocked<PhoneProcurementDbClient>;
  let cleanup: jest.Mocked<TenantPlatformCleanupService>;
  let controller: PhoneProcurementNotifyController;

  const ORIGINAL_ENV = process.env.WEBHOOK_BASE_URL;

  beforeEach(() => {
    procurement = {
      listAvailable: jest.fn(),
      purchase: jest.fn(),
      release: jest.fn().mockResolvedValue({ externalId: 'PN1', released: true }),
      releaseFromProvider: jest.fn().mockResolvedValue({ externalId: 'PN1', released: true }),
      isSandbox: jest.fn().mockReturnValue(false),
      getActiveProviderKey: jest.fn().mockReturnValue('twilio'),
    } as unknown as jest.Mocked<PhoneProcurementService>;

    db = {
      insertPendingPurchase: jest.fn(),
      getPendingPurchase: jest.fn(),
      deletePendingPurchase: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PhoneProcurementDbClient>;

    cleanup = {
      unregisterAll: jest.fn(),
    } as unknown as jest.Mocked<TenantPlatformCleanupService>;

    controller = new PhoneProcurementNotifyController(procurement, db, cleanup);
    jest
      .spyOn((controller as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
    delete process.env.WEBHOOK_BASE_URL;
  });

  afterAll(() => {
    if (ORIGINAL_ENV !== undefined) process.env.WEBHOOK_BASE_URL = ORIGINAL_ENV;
  });

  describe('listAvailableNumbers', () => {
    it('maps available numbers and parses type', async () => {
      procurement.listAvailable.mockResolvedValue([
        {
          phoneE164: '+1',
          capabilities: { sms: true, mms: false, voice: true },
          region: 'CA',
          locality: 'SF',
        },
      ]);

      const res = await controller.listAvailableNumbers({ country: 'US', type: 'mobile', limit: 5 });

      expect(procurement.listAvailable).toHaveBeenCalledWith({ country: 'US', type: 'mobile', limit: 5 });
      expect(res).toEqual({
        status: true,
        message: 'OK',
        numbers: [
          { phoneE164: '+1', capabilities: { sms: true, mms: false, voice: true }, region: 'CA', locality: 'SF' },
        ],
      });
    });

    it('coerces unknown types to undefined and zero limit to undefined', async () => {
      procurement.listAvailable.mockResolvedValue([]);

      await controller.listAvailableNumbers({ country: 'US', type: 'wat', limit: 0 });
      expect(procurement.listAvailable).toHaveBeenCalledWith({ country: 'US', type: undefined, limit: undefined });
    });

    it('returns empty list when provider throws', async () => {
      procurement.listAvailable.mockRejectedValue(new Error('upstream'));
      const res = await controller.listAvailableNumbers({ country: 'US', type: '', limit: 0 });
      expect(res.status).toBe(false);
      expect(res.numbers).toEqual([]);
    });

    it('blanks out missing region/locality on output entries', async () => {
      procurement.listAvailable.mockResolvedValue([
        { phoneE164: '+1', capabilities: { sms: true, mms: false, voice: false } },
      ]);
      const res = await controller.listAvailableNumbers({ country: 'US', type: '', limit: 0 });
      expect(res.numbers[0]).toMatchObject({ region: '', locality: '' });
    });
  });

  describe('purchasePhoneNumber', () => {
    function req(over: Partial<PurchasePhoneNumberRequest> = {}): PurchasePhoneNumberRequest {
      return {
        country: 'PL',
        phoneE164: '+48999',
        ownerUserId: 'u-1',
        ...over,
      } as PurchasePhoneNumberRequest;
    }

    it('purchases via active provider, persists pending row, returns entry', async () => {
      procurement.purchase.mockResolvedValue({
        externalId: 'PN1',
        phoneE164: '+48999',
        capabilities: { sms: true, mms: false, voice: false },
      });
      db.insertPendingPurchase.mockResolvedValue(pending());

      const out = await controller.purchasePhoneNumber(req());

      expect(out.status).toBe(true);
      expect(out.entry?.id).toBe('pp-1');
      expect(db.insertPendingPurchase).toHaveBeenCalledWith({
        ownerUserId: 'u-1',
        providerKey: 'twilio',
        providerExternalId: 'PN1',
        phoneE164: '+48999',
      });
    });

    it('passes webhook URLs derived from WEBHOOK_BASE_URL', async () => {
      process.env.WEBHOOK_BASE_URL = 'https://hooks.example.com/';
      procurement.purchase.mockResolvedValue({
        externalId: 'PN1',
        phoneE164: '+48999',
        capabilities: { sms: true, mms: false, voice: false },
      });
      db.insertPendingPurchase.mockResolvedValue(pending());

      await controller.purchasePhoneNumber(req());

      expect(procurement.purchase).toHaveBeenCalledWith(
        expect.objectContaining({
          webhookSmsUrl: 'https://hooks.example.com/webhooks/twilio/sms',
          webhookVoiceUrl: 'https://hooks.example.com/webhooks/twilio/voice',
        }),
      );
    });

    it('omits webhook URLs when WEBHOOK_BASE_URL is unset', async () => {
      procurement.purchase.mockResolvedValue({
        externalId: 'PN1',
        phoneE164: '+48999',
        capabilities: { sms: true, mms: false, voice: false },
      });
      db.insertPendingPurchase.mockResolvedValue(pending());

      await controller.purchasePhoneNumber(req());

      expect(procurement.purchase).toHaveBeenCalledWith(
        expect.objectContaining({ webhookSmsUrl: undefined, webhookVoiceUrl: undefined }),
      );
    });

    it('compensates with release when DB persist fails', async () => {
      procurement.purchase.mockResolvedValue({
        externalId: 'PN1',
        phoneE164: '+48999',
        capabilities: { sms: true, mms: false, voice: false },
      });
      db.insertPendingPurchase.mockResolvedValue(null);

      const out = await controller.purchasePhoneNumber(req());

      expect(out.status).toBe(false);
      expect(out.message).toContain('persist');
      expect(procurement.release).toHaveBeenCalledWith('PN1');
    });

    it('logs (and still returns failure) when compensating release also fails', async () => {
      procurement.purchase.mockResolvedValue({
        externalId: 'PN1',
        phoneE164: '+48999',
        capabilities: { sms: true, mms: false, voice: false },
      });
      db.insertPendingPurchase.mockResolvedValue(null);
      procurement.release.mockRejectedValue(new Error('twilio gone'));

      const out = await controller.purchasePhoneNumber(req());
      expect(out.status).toBe(false);
    });

    it('returns failure ack when provider.purchase throws', async () => {
      procurement.purchase.mockRejectedValue(new Error('boom'));

      const out = await controller.purchasePhoneNumber(req());
      expect(out.status).toBe(false);
      expect(out.entry).toBeUndefined();
      expect(db.insertPendingPurchase).not.toHaveBeenCalled();
    });
  });

  describe('unregisterTenantPlatforms', () => {
    it('returns aggregate status=true when every platform is OK', async () => {
      cleanup.unregisterAll.mockResolvedValue([
        { platform: 'twilio', status: true, message: 'released' },
        { platform: 'signal', status: true, message: 'unregistered' },
      ]);

      const res = await controller.unregisterTenantPlatforms({ tenantId: 't-1' } as UnregisterTenantPlatformsRequest);
      expect(res.status).toBe(true);
      expect(res.perPlatform).toHaveLength(2);
    });

    it('returns aggregate status=false when any platform fails', async () => {
      cleanup.unregisterAll.mockResolvedValue([
        { platform: 'twilio', status: true, message: 'released' },
        { platform: 'signal', status: false, message: 'unregister failed' },
      ]);

      const res = await controller.unregisterTenantPlatforms({ tenantId: 't-1' } as UnregisterTenantPlatformsRequest);
      expect(res.status).toBe(false);
      expect(res.message).toContain('failed');
    });
  });

  describe('releasePendingPurchase', () => {
    function req(over: Partial<ReleasePendingPurchaseRequest> = {}): ReleasePendingPurchaseRequest {
      return { pendingId: 'pp-1', ownerUserId: 'u-1', ...over } as ReleasePendingPurchaseRequest;
    }

    it('releases through originating provider and deletes the pending row', async () => {
      db.getPendingPurchase.mockResolvedValue(pending());

      const out = await controller.releasePendingPurchase(req());

      expect(procurement.releaseFromProvider).toHaveBeenCalledWith('twilio', 'PN1');
      expect(db.deletePendingPurchase).toHaveBeenCalledWith('pp-1');
      expect(out).toEqual({ status: true, message: 'OK' });
    });

    it('rejects when pending purchase does not exist', async () => {
      db.getPendingPurchase.mockResolvedValue(null);

      const out = await controller.releasePendingPurchase(req());
      expect(out.status).toBe(false);
      expect(out.message).toContain('not found');
      expect(procurement.releaseFromProvider).not.toHaveBeenCalled();
    });

    it('rejects when caller is not the owner', async () => {
      db.getPendingPurchase.mockResolvedValue(pending({ ownerUserId: 'someone-else' }));

      const out = await controller.releasePendingPurchase(req());
      expect(out.status).toBe(false);
      expect(out.message).toContain('owner');
      expect(procurement.releaseFromProvider).not.toHaveBeenCalled();
    });

    it('rejects when pending purchase is already attached', async () => {
      db.getPendingPurchase.mockResolvedValue(pending({ attachedToTenantId: 't-1' }));

      const out = await controller.releasePendingPurchase(req());
      expect(out.status).toBe(false);
      expect(out.message).toContain('attached');
    });

    it('returns failure ack when provider release throws', async () => {
      db.getPendingPurchase.mockResolvedValue(pending());
      procurement.releaseFromProvider.mockRejectedValue(new Error('boom'));

      const out = await controller.releasePendingPurchase(req());
      expect(out.status).toBe(false);
      expect(db.deletePendingPurchase).not.toHaveBeenCalled();
    });
  });

  describe('getActiveProviderInfo', () => {
    it('returns active provider key and sandbox flag', () => {
      procurement.getActiveProviderKey.mockReturnValue('mock');
      procurement.isSandbox.mockReturnValue(true);

      expect(controller.getActiveProviderInfo({})).toEqual({
        status: true,
        providerKey: 'mock',
        isSandbox: true,
      });
    });
  });
});
