import { of } from 'rxjs';
import type { ClientGrpc } from '@nestjs/microservices';
import type {
  PendingPurchaseEntry,
  PhoneProcurementDbServiceClient,
  TenantPhoneNumberEntry,
} from 'src/proto/phone-procurement';
import { PhoneProcurementDbClient } from './phone-procurement-db.client';

function tenantEntry(over: Partial<TenantPhoneNumberEntry> = {}): TenantPhoneNumberEntry {
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

describe('PhoneProcurementDbClient', () => {
  let svc: jest.Mocked<PhoneProcurementDbServiceClient>;
  let grpc: jest.Mocked<ClientGrpc>;
  let client: PhoneProcurementDbClient;

  beforeEach(() => {
    svc = {
      getTenantPhoneNumberByE164: jest.fn(),
      getTenantPhoneNumber: jest.fn(),
      listManagedPhoneNumbers: jest.fn(),
      hasSmsSyncLogForDate: jest.fn(),
      insertSmsSyncLog: jest.fn(),
      incrementMonthlyMessageCount: jest.fn(),
      resetAllMonthlyMessageCounts: jest.fn(),
      listUnattachedPendingPurchases: jest.fn(),
      deletePendingPurchase: jest.fn(),
      insertPendingPurchase: jest.fn(),
      getPendingPurchase: jest.fn(),
      attachPendingPurchaseToTenant: jest.fn(),
    } as unknown as jest.Mocked<PhoneProcurementDbServiceClient>;
    grpc = { getService: jest.fn().mockReturnValue(svc) } as unknown as jest.Mocked<ClientGrpc>;
    client = new PhoneProcurementDbClient(grpc);
    client.onModuleInit();
    jest
      .spyOn((client as unknown as { logger: { warn: jest.Mock } }).logger, 'warn')
      .mockImplementation(() => undefined);
  });

  it('resolves the gRPC handle on init', () => {
    expect(grpc.getService).toHaveBeenCalledWith('PhoneProcurementDbService');
  });

  describe('getTenantPhoneNumberByE164', () => {
    it('returns the entry on success', async () => {
      svc.getTenantPhoneNumberByE164.mockReturnValue(
        of({ status: true, message: 'OK', entry: tenantEntry() } as never),
      );
      expect(await client.getTenantPhoneNumberByE164('+48999')).toEqual(tenantEntry());
      expect(svc.getTenantPhoneNumberByE164).toHaveBeenCalledWith({ phoneE164: '+48999' });
    });

    it('returns null when entry is missing or status=false', async () => {
      svc.getTenantPhoneNumberByE164.mockReturnValue(of({ status: false, message: '', entry: undefined } as never));
      expect(await client.getTenantPhoneNumberByE164('+48999')).toBeNull();
    });
  });

  describe('getTenantPhoneNumber', () => {
    it('returns the entry on success', async () => {
      svc.getTenantPhoneNumber.mockReturnValue(of({ status: true, message: 'OK', entry: tenantEntry() } as never));
      expect(await client.getTenantPhoneNumber('t-1')).toEqual(tenantEntry());
    });

    it('returns null when not found', async () => {
      svc.getTenantPhoneNumber.mockReturnValue(of({ status: true, message: 'OK', entry: undefined } as never));
      expect(await client.getTenantPhoneNumber('t-1')).toBeNull();
    });
  });

  describe('listManagedPhoneNumbers', () => {
    it('returns entries when status=true', async () => {
      svc.listManagedPhoneNumbers.mockReturnValue(
        of({ status: true, message: 'OK', entries: [tenantEntry()] } as never),
      );
      expect(await client.listManagedPhoneNumbers()).toHaveLength(1);
    });

    it('returns [] when status=false', async () => {
      svc.listManagedPhoneNumbers.mockReturnValue(of({ status: false, message: '', entries: [] } as never));
      expect(await client.listManagedPhoneNumbers()).toEqual([]);
    });

    it('returns [] when entries field is missing', async () => {
      svc.listManagedPhoneNumbers.mockReturnValue(of({ status: true, message: 'OK', entries: undefined } as never));
      expect(await client.listManagedPhoneNumbers()).toEqual([]);
    });
  });

  describe('hasSmsSyncLogForDate', () => {
    it('returns true when both status and exists are true', async () => {
      svc.hasSmsSyncLogForDate.mockReturnValue(of({ status: true, message: 'OK', exists: true } as never));
      expect(await client.hasSmsSyncLogForDate('t-1', '2026-05-03')).toBe(true);
    });

    it('returns false otherwise', async () => {
      svc.hasSmsSyncLogForDate.mockReturnValue(of({ status: true, message: 'OK', exists: false } as never));
      expect(await client.hasSmsSyncLogForDate('t-1', '2026-05-03')).toBe(false);
    });
  });

  describe('insertSmsSyncLog', () => {
    it('forwards args to gRPC', async () => {
      svc.insertSmsSyncLog.mockReturnValue(of({} as never));
      await client.insertSmsSyncLog('t-1', '2026-05-03', 12);
      expect(svc.insertSmsSyncLog).toHaveBeenCalledWith({
        tenantId: 't-1',
        syncDate: '2026-05-03',
        messagesCounted: 12,
      });
    });
  });

  describe('incrementMonthlyMessageCount', () => {
    it('passes ISO timestamp from Date', async () => {
      svc.incrementMonthlyMessageCount.mockReturnValue(of({} as never));
      const d = new Date('2026-05-04T00:00:00Z');
      await client.incrementMonthlyMessageCount('t-1', 5, d);
      expect(svc.incrementMonthlyMessageCount).toHaveBeenCalledWith({
        tenantId: 't-1',
        delta: 5,
        syncedAt: '2026-05-04T00:00:00.000Z',
      });
    });
  });

  describe('resetAllMonthlyMessageCounts', () => {
    it('calls the rpc with empty payload', async () => {
      svc.resetAllMonthlyMessageCounts.mockReturnValue(of({} as never));
      await client.resetAllMonthlyMessageCounts();
      expect(svc.resetAllMonthlyMessageCounts).toHaveBeenCalledWith({});
    });
  });

  describe('listUnattachedPendingPurchases', () => {
    it('returns entries on success', async () => {
      svc.listUnattachedPendingPurchases.mockReturnValue(
        of({ status: true, message: 'OK', entries: [pending()] } as never),
      );
      const got = await client.listUnattachedPendingPurchases(new Date('2026-05-04T00:00:00Z'));
      expect(got).toHaveLength(1);
      expect(svc.listUnattachedPendingPurchases).toHaveBeenCalledWith({ cutoffIso: '2026-05-04T00:00:00.000Z' });
    });

    it('returns [] on status=false', async () => {
      svc.listUnattachedPendingPurchases.mockReturnValue(of({ status: false, message: '', entries: [] } as never));
      expect(await client.listUnattachedPendingPurchases(new Date())).toEqual([]);
    });
  });

  describe('deletePendingPurchase', () => {
    it('calls the rpc', async () => {
      svc.deletePendingPurchase.mockReturnValue(of({} as never));
      await client.deletePendingPurchase('pp-1');
      expect(svc.deletePendingPurchase).toHaveBeenCalledWith({ pendingId: 'pp-1' });
    });
  });

  describe('insertPendingPurchase', () => {
    it('returns the entry on success', async () => {
      svc.insertPendingPurchase.mockReturnValue(of({ status: true, message: 'OK', entry: pending() } as never));
      const out = await client.insertPendingPurchase({
        ownerUserId: 'u-1',
        providerKey: 'twilio',
        providerExternalId: 'PN1',
        phoneE164: '+48999',
      });
      expect(out).toEqual(pending());
    });

    it('returns null on failure', async () => {
      svc.insertPendingPurchase.mockReturnValue(of({ status: false, message: 'oops', entry: undefined } as never));
      expect(
        await client.insertPendingPurchase({
          ownerUserId: 'u-1',
          providerKey: 'twilio',
          providerExternalId: 'PN1',
          phoneE164: '+48999',
        }),
      ).toBeNull();
    });
  });

  describe('getPendingPurchase', () => {
    it('returns entry on success', async () => {
      svc.getPendingPurchase.mockReturnValue(of({ status: true, message: 'OK', entry: pending() } as never));
      expect(await client.getPendingPurchase('pp-1')).toEqual(pending());
    });

    it('returns null on miss', async () => {
      svc.getPendingPurchase.mockReturnValue(of({ status: false, message: 'no', entry: undefined } as never));
      expect(await client.getPendingPurchase('pp-1')).toBeNull();
    });
  });

  describe('attachPendingPurchaseToTenant', () => {
    it('returns entry on success', async () => {
      svc.attachPendingPurchaseToTenant.mockReturnValue(
        of({ status: true, message: 'OK', entry: pending({ attachedToTenantId: 't-1' }) } as never),
      );
      const out = await client.attachPendingPurchaseToTenant('pp-1', 't-1', 'managed');
      expect(out?.attachedToTenantId).toBe('t-1');
      expect(svc.attachPendingPurchaseToTenant).toHaveBeenCalledWith({
        pendingId: 'pp-1',
        tenantId: 't-1',
        provisionedBy: 'managed',
      });
    });

    it('returns null and logs warn when status=false', async () => {
      svc.attachPendingPurchaseToTenant.mockReturnValue(
        of({ status: false, message: 'mismatch', entry: undefined } as never),
      );
      const out = await client.attachPendingPurchaseToTenant('pp-1', 't-1', 'self');
      expect(out).toBeNull();
      const warn = (client as unknown as { logger: { warn: jest.Mock } }).logger.warn;
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('mismatch'));
    });

    it('returns null when entry field is missing despite status=true (defensive)', async () => {
      svc.attachPendingPurchaseToTenant.mockReturnValue(of({ status: true, message: 'OK', entry: undefined } as never));
      expect(await client.attachPendingPurchaseToTenant('pp-1', 't-1', 'managed')).toBeNull();
    });
  });
});
