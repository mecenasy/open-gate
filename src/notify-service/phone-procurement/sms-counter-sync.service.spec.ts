import type { TenantPhoneNumberEntry } from 'src/proto/phone-procurement';
import type { PhoneProcurementDbClient } from './db/phone-procurement-db.client';
import type { PhoneProcurementService } from './phone-procurement.service';
import { SmsCounterSyncService } from './sms-counter-sync.service';

function row(over: Partial<TenantPhoneNumberEntry> = {}): TenantPhoneNumberEntry {
  return {
    id: 'tpn-1',
    tenantId: 't-1',
    phoneE164: '+48999',
    providerKey: 'twilio',
    providerExternalId: 'PN1',
    provisionedBy: 'managed',
    monthlyMessageCount: 0,
    lastSyncedAt: '',
    purchasedAt: '2026-01-01T00:00:00Z',
    ...over,
  };
}

describe('SmsCounterSyncService.syncDaily', () => {
  let procurement: jest.Mocked<PhoneProcurementService>;
  let db: jest.Mocked<PhoneProcurementDbClient>;
  let svc: SmsCounterSyncService;

  beforeEach(() => {
    procurement = {
      countMessagesForRange: jest.fn(),
    } as unknown as jest.Mocked<PhoneProcurementService>;
    db = {
      listManagedPhoneNumbers: jest.fn(),
      hasSmsSyncLogForDate: jest.fn().mockResolvedValue(false),
      insertSmsSyncLog: jest.fn().mockResolvedValue(undefined),
      incrementMonthlyMessageCount: jest.fn().mockResolvedValue(undefined),
      resetAllMonthlyMessageCounts: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PhoneProcurementDbClient>;

    svc = new SmsCounterSyncService(procurement, db);
    jest
      .spyOn((svc as unknown as { logger: { log: jest.Mock; debug: jest.Mock; error: jest.Mock } }).logger, 'log')
      .mockImplementation(() => undefined);
    jest
      .spyOn((svc as unknown as { logger: { debug: jest.Mock } }).logger, 'debug')
      .mockImplementation(() => undefined);
    jest
      .spyOn((svc as unknown as { logger: { error: jest.Mock } }).logger, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => jest.useRealTimers());

  it('logs at debug and exits when no managed numbers exist', async () => {
    db.listManagedPhoneNumbers.mockResolvedValue([]);
    await svc.syncDaily();
    expect(procurement.countMessagesForRange).not.toHaveBeenCalled();
    expect(db.resetAllMonthlyMessageCounts).not.toHaveBeenCalled();
  });

  it('skips a row whose sync_log row already exists for the date', async () => {
    db.listManagedPhoneNumbers.mockResolvedValue([row()]);
    db.hasSmsSyncLogForDate.mockResolvedValue(true);

    await svc.syncDaily();

    expect(procurement.countMessagesForRange).not.toHaveBeenCalled();
    expect(db.insertSmsSyncLog).not.toHaveBeenCalled();
  });

  it('skips a row whose provider returns null (e.g. mock sandbox)', async () => {
    db.listManagedPhoneNumbers.mockResolvedValue([row({ providerKey: 'mock' })]);
    procurement.countMessagesForRange.mockResolvedValue(null);

    await svc.syncDaily();

    expect(db.insertSmsSyncLog).not.toHaveBeenCalled();
    expect(db.incrementMonthlyMessageCount).not.toHaveBeenCalled();
  });

  it('persists sync log + increments monthly counter for synced rows', async () => {
    db.listManagedPhoneNumbers.mockResolvedValue([row(), row({ tenantId: 't-2', phoneE164: '+48222' })]);
    procurement.countMessagesForRange.mockResolvedValueOnce(7).mockResolvedValueOnce(13);

    jest.useFakeTimers().setSystemTime(new Date('2026-05-04T08:00:00Z'));

    await svc.syncDaily();

    expect(db.insertSmsSyncLog).toHaveBeenNthCalledWith(1, 't-1', '2026-05-03', 7);
    expect(db.insertSmsSyncLog).toHaveBeenNthCalledWith(2, 't-2', '2026-05-03', 13);
    expect(db.incrementMonthlyMessageCount).toHaveBeenCalledTimes(2);
    expect(db.resetAllMonthlyMessageCounts).not.toHaveBeenCalled();
  });

  it('resets monthly counters when today is the 1st (after recording yesterday)', async () => {
    db.listManagedPhoneNumbers.mockResolvedValue([row()]);
    procurement.countMessagesForRange.mockResolvedValue(5);
    jest.useFakeTimers().setSystemTime(new Date('2026-06-01T08:00:00Z'));

    await svc.syncDaily();

    expect(db.insertSmsSyncLog).toHaveBeenCalledWith('t-1', '2026-05-31', 5);
    expect(db.resetAllMonthlyMessageCounts).toHaveBeenCalledTimes(1);
  });

  it('catches errors per-row and continues to next row', async () => {
    db.listManagedPhoneNumbers.mockResolvedValue([row(), row({ tenantId: 't-2' })]);
    procurement.countMessagesForRange.mockRejectedValueOnce(new Error('twilio flap')).mockResolvedValueOnce(3);

    await svc.syncDaily();

    // First row failed → no insert/increment for it; second row went through.
    expect(db.insertSmsSyncLog).toHaveBeenCalledTimes(1);
    expect(db.insertSmsSyncLog).toHaveBeenCalledWith('t-2', expect.any(String), 3);
  });
});
