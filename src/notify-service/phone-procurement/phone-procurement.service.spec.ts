import type { ConfigService } from '@nestjs/config';
import { PhoneProcurementProvider } from './providers/phone-procurement.provider';
import { PhoneProcurementService } from './phone-procurement.service';
import type {
  AvailableNumber,
  CountMessagesOptions,
  ListAvailableOptions,
  PurchaseOptions,
  PurchaseResult,
  ReleaseResult,
} from './phone-procurement.types';

class FakeProvider extends PhoneProcurementProvider {
  constructor(
    public readonly providerKey: string,
    private readonly withCount = true,
  ) {
    super();
  }
  listAvailable = jest.fn<Promise<AvailableNumber[]>, [ListAvailableOptions]>().mockResolvedValue([]);
  purchase = jest
    .fn<Promise<PurchaseResult>, [PurchaseOptions]>()
    .mockResolvedValue({ externalId: 'X', phoneE164: '+1', capabilities: { sms: true, mms: false, voice: false } });
  release = jest.fn<Promise<ReleaseResult>, [string]>().mockResolvedValue({ externalId: 'X', released: true });
  countMessagesForRange = jest.fn<Promise<number>, [CountMessagesOptions]>().mockResolvedValue(0);

  // For mock-style providers that don't implement counting:
  stripCount(): this {
    delete (this as { countMessagesForRange?: unknown }).countMessagesForRange;
    return this;
  }
}

function configWith(values: Record<string, unknown>): ConfigService {
  return { get: jest.fn((k: string) => values[k]) } as unknown as ConfigService;
}

describe('PhoneProcurementService', () => {
  it('throws on duplicate providerKey', () => {
    expect(
      () => new PhoneProcurementService([new FakeProvider('twilio'), new FakeProvider('twilio')], configWith({})),
    ).toThrow(/Duplicate phone procurement provider/);
  });

  describe('active provider selection', () => {
    it('picks "mock" when TWILIO_SANDBOX=true and mock is registered', () => {
      const svc = new PhoneProcurementService(
        [new FakeProvider('twilio'), new FakeProvider('mock')],
        configWith({ TWILIO_SANDBOX: true }),
      );
      expect(svc.getActiveProviderKey()).toBe('mock');
      expect(svc.isSandbox()).toBe(true);
    });

    it('picks "twilio" when sandbox is off', () => {
      const svc = new PhoneProcurementService(
        [new FakeProvider('mock'), new FakeProvider('twilio')],
        configWith({ TWILIO_SANDBOX: false }),
      );
      expect(svc.getActiveProviderKey()).toBe('twilio');
      expect(svc.isSandbox()).toBe(false);
    });

    it('falls through to first registered when neither mock+sandbox nor twilio match', () => {
      const svc = new PhoneProcurementService([new FakeProvider('exotic')], configWith({}));
      expect(svc.getActiveProviderKey()).toBe('exotic');
    });

    it('falls back to "twilio" key when zero providers are registered (defensive)', () => {
      const svc = new PhoneProcurementService([], configWith({}));
      expect(svc.getActiveProviderKey()).toBe('twilio');
    });

    it('TWILIO_SANDBOX=true without mock registered → still falls back to twilio', () => {
      const svc = new PhoneProcurementService([new FakeProvider('twilio')], configWith({ TWILIO_SANDBOX: true }));
      expect(svc.getActiveProviderKey()).toBe('twilio');
    });
  });

  describe('routing', () => {
    it('listAvailable goes to active provider', async () => {
      const twilio = new FakeProvider('twilio');
      const svc = new PhoneProcurementService([twilio], configWith({}));

      await svc.listAvailable({ country: 'PL' });
      expect(twilio.listAvailable).toHaveBeenCalledWith({ country: 'PL' });
    });

    it('purchase goes to active provider', async () => {
      const twilio = new FakeProvider('twilio');
      const svc = new PhoneProcurementService([twilio], configWith({}));

      await svc.purchase({ country: 'PL', phoneE164: '+1' });
      expect(twilio.purchase).toHaveBeenCalled();
    });

    it('release goes to active provider', async () => {
      const twilio = new FakeProvider('twilio');
      const svc = new PhoneProcurementService([twilio], configWith({}));

      await svc.release('SID');
      expect(twilio.release).toHaveBeenCalledWith('SID');
    });

    it('releaseFromProvider routes by key', async () => {
      const twilio = new FakeProvider('twilio');
      const mock = new FakeProvider('mock');
      const svc = new PhoneProcurementService([twilio, mock], configWith({}));

      await svc.releaseFromProvider('mock', 'SID');
      expect(mock.release).toHaveBeenCalledWith('SID');
      expect(twilio.release).not.toHaveBeenCalled();
    });

    it('releaseFromProvider throws when key is unknown', () => {
      const svc = new PhoneProcurementService([new FakeProvider('twilio')], configWith({}));
      expect(() => svc.releaseFromProvider('alien', 'SID')).toThrow(/No phone procurement provider/);
    });
  });

  describe('countMessagesForRange', () => {
    it('returns null when provider does not implement counting', async () => {
      const mock = new FakeProvider('mock').stripCount();
      const svc = new PhoneProcurementService([mock], configWith({}));

      const got = await svc.countMessagesForRange('mock', {
        phoneE164: '+1',
        fromUtc: new Date('2026-05-03T00:00:00Z'),
        toUtc: new Date('2026-05-04T00:00:00Z'),
      });
      expect(got).toBeNull();
    });

    it('delegates to provider when implemented', async () => {
      const twilio = new FakeProvider('twilio');
      twilio.countMessagesForRange.mockResolvedValue(42);
      const svc = new PhoneProcurementService([twilio], configWith({}));

      const got = await svc.countMessagesForRange('twilio', {
        phoneE164: '+1',
        fromUtc: new Date(),
        toUtc: new Date(),
      });
      expect(got).toBe(42);
    });

    it('throws when key is unknown', async () => {
      const svc = new PhoneProcurementService([new FakeProvider('twilio')], configWith({}));
      // countMessagesForRange is async, so the throw is wrapped into a rejection.
      await expect(
        svc.countMessagesForRange('alien', { phoneE164: '+1', fromUtc: new Date(), toUtc: new Date() }),
      ).rejects.toThrow(/No phone procurement provider/);
    });
  });
});
