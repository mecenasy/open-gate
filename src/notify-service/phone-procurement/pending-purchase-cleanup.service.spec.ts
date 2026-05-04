import type { PendingPurchaseEntry } from 'src/proto/phone-procurement';
import type { PhoneProcurementDbClient } from './db/phone-procurement-db.client';
import type { PhoneProcurementService } from './phone-procurement.service';
import { PendingPurchaseCleanupService } from './pending-purchase-cleanup.service';

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

describe('PendingPurchaseCleanupService.cleanupStale', () => {
  let procurement: jest.Mocked<PhoneProcurementService>;
  let db: jest.Mocked<PhoneProcurementDbClient>;
  let svc: PendingPurchaseCleanupService;
  let logger: { log: jest.Mock; debug: jest.Mock; warn: jest.Mock };

  beforeEach(() => {
    procurement = {
      releaseFromProvider: jest.fn().mockResolvedValue({ externalId: 'PN1', released: true }),
    } as unknown as jest.Mocked<PhoneProcurementService>;
    db = {
      listUnattachedPendingPurchases: jest.fn(),
      deletePendingPurchase: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PhoneProcurementDbClient>;

    svc = new PendingPurchaseCleanupService(procurement, db);
    logger = (svc as unknown as { logger: typeof logger }).logger;
    jest.spyOn(logger, 'log').mockImplementation(() => undefined);
    jest.spyOn(logger, 'debug').mockImplementation(() => undefined);
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
  });

  it('passes a 24h cutoff to listUnattachedPendingPurchases', async () => {
    db.listUnattachedPendingPurchases.mockResolvedValue([]);
    const before = Date.now();
    await svc.cleanupStale();
    const cutoff = db.listUnattachedPendingPurchases.mock.calls[0][0] as Date;
    const elapsed = before - cutoff.getTime();
    expect(elapsed).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 1000);
    expect(elapsed).toBeLessThan(24 * 60 * 60 * 1000 + 5000);
  });

  it('logs at debug and exits when nothing is stale', async () => {
    db.listUnattachedPendingPurchases.mockResolvedValue([]);
    await svc.cleanupStale();

    expect(procurement.releaseFromProvider).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  it('releases each stale row through its originating provider then deletes the row', async () => {
    db.listUnattachedPendingPurchases.mockResolvedValue([
      pending(),
      pending({ id: 'pp-2', providerKey: 'mock', providerExternalId: 'mock-1' }),
    ]);

    await svc.cleanupStale();

    expect(procurement.releaseFromProvider).toHaveBeenNthCalledWith(1, 'twilio', 'PN1');
    expect(procurement.releaseFromProvider).toHaveBeenNthCalledWith(2, 'mock', 'mock-1');
    expect(db.deletePendingPurchase).toHaveBeenCalledWith('pp-1');
    expect(db.deletePendingPurchase).toHaveBeenCalledWith('pp-2');
  });

  it('continues to the next row when one release fails (best-effort)', async () => {
    db.listUnattachedPendingPurchases.mockResolvedValue([pending(), pending({ id: 'pp-2' })]);
    procurement.releaseFromProvider
      .mockRejectedValueOnce(new Error('twilio flap'))
      .mockResolvedValueOnce({ externalId: 'PN1', released: true });

    await svc.cleanupStale();

    expect(db.deletePendingPurchase).toHaveBeenCalledTimes(1);
    expect(db.deletePendingPurchase).toHaveBeenCalledWith('pp-2');
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('twilio flap'));
  });

  it('does not delete when delete itself rejects (next run will retry)', async () => {
    db.listUnattachedPendingPurchases.mockResolvedValue([pending()]);
    db.deletePendingPurchase.mockRejectedValue(new Error('db flap'));

    await svc.cleanupStale();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('db flap'));
  });
});
